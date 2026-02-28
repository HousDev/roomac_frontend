
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Facebook, 
  Instagram, 
  Linkedin,
  ChevronRight,
  Info,
  Tag,
  AtSign
} from 'lucide-react';

interface GeneralSettingsProps {
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => void;
}

export default function GeneralSettings({ settings, updateSetting }: GeneralSettingsProps) {
  return (
    <TabsContent value="general" className="mt-0">
      <div className="space-y-4">
       

        {/* Main Card */}
        <Card className="border-0 shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
          {/* Card Header with Gradient */}
          <div className="relative px-6 pt-6 pb-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-blue-100">
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
            <div className="relative flex items-start gap-4">
              <div className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-slate-800 mb-1">
                  Site Configuration
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Configure your website's basic information and contact details
                </CardDescription>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Site Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Tag className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Site Information</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent ml-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Site Name */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-blue-600 rounded-full" />
                    Site Name
                  </Label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      value={settings.site_name || ''}
                      onChange={(e) => updateSetting('site_name', e.target.value)}
                      placeholder="ROOMAC"
                      className="h-10 pl-9 text-sm border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Your website's display name</p>
                </div>

                {/* Site Tagline */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-blue-600 rounded-full" />
                    Site Tagline
                  </Label>
                  <div className="relative group">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      value={settings.site_tagline || ''}
                      onChange={(e) => updateSetting('site_tagline', e.target.value)}
                      placeholder="Comfort, Care, and Quality Accommodation"
                      className="h-10 pl-9 text-sm border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all"
                    />
                  </div>
                  <p className="text-xs text-slate-500">A short description of your brand</p>
                </div>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            {/* Contact Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <Phone className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Contact Details</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-green-200 to-transparent ml-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Contact Email */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                    Contact Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      value={settings.contact_email || ''}
                      onChange={(e) => updateSetting('contact_email', e.target.value)}
                      placeholder="info@roomac.com"
                      className="h-10 pl-9 text-sm border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 rounded-xl transition-all"
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    Contact Phone
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={settings.contact_phone || ''}
                      onChange={(e) => updateSetting('contact_phone', e.target.value)}
                      placeholder="+919876543210"
                      className="h-10 pl-9 text-sm border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 rounded-xl transition-all"
                    />
                  </div>
                </div>

                {/* WhatsApp Number */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-slate-500" />
                    WhatsApp Number
                  </Label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={settings.whatsapp_number || ''}
                      onChange={(e) => updateSetting('whatsapp_number', e.target.value)}
                      placeholder="919876543210"
                      className="h-10 pl-9 text-sm border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 rounded-xl transition-all"
                    />
                  </div>
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="text-sm">₹</span>
                    Currency
                  </Label>
                  <Select
                    value={settings.currency || 'INR'}
                    onValueChange={(value) => updateSetting('currency', value)}
                  >
                    <SelectTrigger className="h-10 text-sm border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR" className="text-sm">🇮🇳 INR (₹) - Indian Rupee</SelectItem>
                      <SelectItem value="USD" className="text-sm">🇺🇸 USD ($) - US Dollar</SelectItem>
                      <SelectItem value="EUR" className="text-sm">🇪🇺 EUR (€) - Euro</SelectItem>
                      <SelectItem value="GBP" className="text-sm">🇬🇧 GBP (£) - British Pound</SelectItem>
                      <SelectItem value="JPY" className="text-sm">🇯🇵 JPY (¥) - Japanese Yen</SelectItem>
                      <SelectItem value="AUD" className="text-sm">🇦🇺 AUD ($) - Australian Dollar</SelectItem>
                      <SelectItem value="CAD" className="text-sm">🇨🇦 CAD ($) - Canadian Dollar</SelectItem>
                      <SelectItem value="SGD" className="text-sm">🇸🇬 SGD ($) - Singapore Dollar</SelectItem>
                      <SelectItem value="AED" className="text-sm">🇦🇪 AED (د.إ) - UAE Dirham</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Contact Address - Full Width */}
                <div className="space-y-2 lg:col-span-3">
                  <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    Contact Address
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Textarea
                      value={settings.contact_address || ''}
                      onChange={(e) => updateSetting('contact_address', e.target.value)}
                      placeholder="Hinjawadi, Pune, Maharashtra 411057"
                      rows={3}
                      className="pl-9 text-sm border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 rounded-xl transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            {/* Social Media Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <Facebook className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Social Media Links</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent ml-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Facebook */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <Facebook className="h-3.5 w-3.5 text-blue-600" />
                    Facebook URL
                  </Label>
                  <div className="relative group">
                    <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      value={settings.facebook_url || ''}
                      onChange={(e) => updateSetting('facebook_url', e.target.value)}
                      placeholder="https://facebook.com/roomac"
                      className="h-10 pl-9 text-sm border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-xl transition-all"
                    />
                  </div>
                </div>

                {/* Instagram */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <Instagram className="h-3.5 w-3.5 text-pink-600" />
                    Instagram URL
                  </Label>
                  <div className="relative group">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-pink-600 transition-colors" />
                    <Input
                      value={settings.instagram_url || ''}
                      onChange={(e) => updateSetting('instagram_url', e.target.value)}
                      placeholder="https://instagram.com/roomac"
                      className="h-10 pl-9 text-sm border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-xl transition-all"
                    />
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <Linkedin className="h-3.5 w-3.5 text-blue-700" />
                    LinkedIn URL
                  </Label>
                  <div className="relative group">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-700 transition-colors" />
                    <Input
                      value={settings.linkedin_url || ''}
                      onChange={(e) => updateSetting('linkedin_url', e.target.value)}
                      placeholder="https://linkedin.com/company/roomac"
                      className="h-10 pl-9 text-sm border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-xl transition-all"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <Info className="h-4 w-4 text-slate-400" />
                  Social media links will appear in the website footer and contact sections.
                </p>
              </div>
            </div>

            {/* Save Status Indicator (non-functional, just for UI) */}
            <div className="flex items-center justify-end gap-2 mt-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                All changes saved
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}