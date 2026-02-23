import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Building2 } from 'lucide-react';

interface GeneralSettingsProps {
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => void;
}

export default function GeneralSettings({ settings, updateSetting }: GeneralSettingsProps) {
  return (
    <TabsContent value="general">
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-0 border-b">
          <CardHeader className="p-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-[#004AAD]" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-800">General Settings</CardTitle>
                <CardDescription className="text-xs text-slate-600">Basic site information and contact details</CardDescription>
              </div>
            </div>
          </CardHeader>
        </div>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#004AAD] rounded-full"></span>
                Site Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-700 font-medium">Site Name</Label>
                  <Input
                    value={settings.site_name || ''}
                    onChange={(e) => updateSetting('site_name', e.target.value)}
                    placeholder="ROOMAC"
                    className="h-8 text-sm border-slate-300 focus:border-[#004AAD] focus:ring-[#004AAD]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-700 font-medium">Site Tagline</Label>
                  <Input
                    value={settings.site_tagline || ''}
                    onChange={(e) => updateSetting('site_tagline', e.target.value)}
                    placeholder="Comfort, Care, and Quality Accommodation"
                    className="h-8 text-sm border-slate-300 focus:border-[#004AAD] focus:ring-[#004AAD]"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-1" />

            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#004AAD] rounded-full"></span>
                Contact Details
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-700 font-medium">Contact Email</Label>
                  <Input
                    type="email"
                    value={settings.contact_email || ''}
                    onChange={(e) => updateSetting('contact_email', e.target.value)}
                    placeholder="info@roomac.com"
                    className="h-8 text-sm border-slate-300 focus:border-[#004AAD] focus:ring-[#004AAD]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-700 font-medium">Contact Phone</Label>
                  <Input
                    value={settings.contact_phone || ''}
                    onChange={(e) => updateSetting('contact_phone', e.target.value)}
                    placeholder="+919876543210"
                    className="h-8 text-sm border-slate-300 focus:border-[#004AAD] focus:ring-[#004AAD]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-700 font-medium">WhatsApp Number</Label>
                  <Input
                    value={settings.whatsapp_number || ''}
                    onChange={(e) => updateSetting('whatsapp_number', e.target.value)}
                    placeholder="919876543210"
                    className="h-8 text-sm border-slate-300 focus:border-[#004AAD] focus:ring-[#004AAD]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-700 font-medium">Currency</Label>
                  <Select
                    value={settings.currency || 'INR'}
                    onValueChange={(value) => updateSetting('currency', value)}
                  >
                    <SelectTrigger className="h-8 text-sm border-slate-300 focus:ring-[#004AAD]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR" className="text-sm">INR (₹)</SelectItem>
                      <SelectItem value="USD" className="text-sm">USD ($)</SelectItem>
                      <SelectItem value="EUR" className="text-sm">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 lg:col-span-2">
                  <Label className="text-xs text-slate-700 font-medium">Contact Address</Label>
                  <Textarea
                    value={settings.contact_address || ''}
                    onChange={(e) => updateSetting('contact_address', e.target.value)}
                    placeholder="Hinjawadi, Pune, Maharashtra 411057"
                    rows={2}
                    className="text-sm border-slate-300 focus:border-[#004AAD] focus:ring-[#004AAD]"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-1" />

            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#004AAD] rounded-full"></span>
                Social Media Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-700 font-medium">Facebook URL</Label>
                  <Input
                    value={settings.facebook_url || ''}
                    onChange={(e) => updateSetting('facebook_url', e.target.value)}
                    placeholder="https://facebook.com/roomac"
                    className="h-8 text-sm border-slate-300 focus:border-[#004AAD] focus:ring-[#004AAD]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-700 font-medium">Instagram URL</Label>
                  <Input
                    value={settings.instagram_url || ''}
                    onChange={(e) => updateSetting('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/roomac"
                    className="h-8 text-sm border-slate-300 focus:border-[#004AAD] focus:ring-[#004AAD]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-700 font-medium">LinkedIn URL</Label>
                  <Input
                    value={settings.linkedin_url || ''}
                    onChange={(e) => updateSetting('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/company/roomac"
                    className="h-8 text-sm border-slate-300 focus:border-[#004AAD] focus:ring-[#004AAD]"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}