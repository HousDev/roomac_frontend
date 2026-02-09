import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Palette, Upload, RefreshCw } from 'lucide-react';
import Image from 'next/image';

interface BrandingSettingsProps {
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => void;
  uploading: Record<string, boolean>;
  handleFileUpload: (key: string, file: File) => Promise<void>;
}

export default function BrandingSettings({ 
  settings, 
  updateSetting, 
  uploading, 
  handleFileUpload 
}: BrandingSettingsProps) {

  const triggerFileInput = (key: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(key, file);
      }
    };
    input.click();
  };

  return (
    <TabsContent value="branding">
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b">
          <CardHeader className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Palette className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-800">Branding & Logo Management</CardTitle>
                <CardDescription className="text-slate-600">Upload and manage logos for different sections of your website</CardDescription>
              </div>
            </div>
          </CardHeader>
        </div>
        <CardContent className="p-6 space-y-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Logo Management
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[
                  { key: 'logo_header', label: 'Header Logo', desc: 'Recommended: 200x60px', bg: 'bg-white' },
                  { key: 'logo_footer', label: 'Footer Logo', desc: 'Recommended: 180x50px', bg: 'bg-slate-900' },
                  { key: 'logo_admin_sidebar', label: 'Admin Sidebar Logo', desc: 'Recommended: 150x50px', bg: 'bg-[#004AAD]' },
                  { key: 'favicon_url', label: 'Favicon', desc: 'Recommended: 32x32px', bg: 'bg-white' }
                ].map((item) => (
                  <div key={item.key} className="space-y-4">
                    <div>
                      <Label className="text-slate-700 font-medium block mb-2">{item.label}</Label>
                      <div className="flex gap-2">
                        <Input
                          value={settings[item.key] || ''}
                          onChange={(e) => updateSetting(item.key, e.target.value)}
                          placeholder={`https://example.com/${item.key.replace(/_/g, '-')}.png`}
                          className="h-11 border-slate-300 focus:border-purple-600 focus:ring-purple-600"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => triggerFileInput(item.key)}
                          disabled={uploading[item.key]}
                          className="h-11 w-11 border-slate-300 hover:border-purple-600 hover:bg-purple-50"
                        >
                          {uploading[item.key] ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{item.desc}</p>
                    </div>
                    {settings[item.key] && (
                      <div className={`${item.bg} border border-slate-200 rounded-xl p-6 flex items-center justify-center h-32 transition-all duration-300 hover:shadow-md`}>
                        <img 
                          src={settings[item.key]} 
                          alt={item.label} 
                          className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105" 
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Brand Colors
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-slate-700 font-medium">Primary Color</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Input
                        type="color"
                        value={settings.primary_color || '#004AAD'}
                        onChange={(e) => updateSetting('primary_color', e.target.value)}
                        className="w-16 h-16 rounded-xl cursor-pointer border-0 shadow-sm"
                      />
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-md border text-xs font-medium shadow-sm">
                        Primary
                      </div>
                    </div>
                    <div className="flex-1">
                      <Input
                        value={settings.primary_color || '#004AAD'}
                        onChange={(e) => updateSetting('primary_color', e.target.value)}
                        placeholder="#004AAD"
                        className="h-11 border-slate-300 focus:border-purple-600 focus:ring-purple-600"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: settings.primary_color || '#004AAD' }}></div>
                    <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: settings.primary_color || '#004AAD', opacity: 0.8 }}></div>
                    <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: settings.primary_color || '#004AAD', opacity: 0.6 }}></div>
                    <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: settings.primary_color || '#004AAD', opacity: 0.4 }}></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-slate-700 font-medium">Secondary Color</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Input
                        type="color"
                        value={settings.secondary_color || '#FFC107'}
                        onChange={(e) => updateSetting('secondary_color', e.target.value)}
                        className="w-16 h-16 rounded-xl cursor-pointer border-0 shadow-sm"
                      />
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-md border text-xs font-medium shadow-sm">
                        Secondary
                      </div>
                    </div>
                    <div className="flex-1">
                      <Input
                        value={settings.secondary_color || '#FFC107'}
                        onChange={(e) => updateSetting('secondary_color', e.target.value)}
                        placeholder="#FFC107"
                        className="h-11 border-slate-300 focus:border-purple-600 focus:ring-purple-600"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: settings.secondary_color || '#FFC107' }}></div>
                    <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: settings.secondary_color || '#FFC107', opacity: 0.8 }}></div>
                    <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: settings.secondary_color || '#FFC107', opacity: 0.6 }}></div>
                    <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: settings.secondary_color || '#FFC107', opacity: 0.4 }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}