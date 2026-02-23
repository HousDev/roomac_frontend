import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Palette, Upload, RefreshCw } from 'lucide-react';

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
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-2 border-b">
          <CardHeader className="p-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Palette className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-800">Branding & Logo Management</CardTitle>
                <CardDescription className="text-xs text-slate-600">Upload and manage logos for your website</CardDescription>
              </div>
            </div>
          </CardHeader>
        </div>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                Logo Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'logo_header', label: 'Header Logo', desc: '200x60px', bg: 'bg-white' },
                  { key: 'logo_footer', label: 'Footer Logo', desc: '180x50px', bg: 'bg-slate-900' },
                  { key: 'logo_admin_sidebar', label: 'Admin Logo', desc: '150x50px', bg: 'bg-[#004AAD]' },
                  { key: 'favicon_url', label: 'Favicon', desc: '32x32px', bg: 'bg-white' }
                ].map((item) => (
                  <div key={item.key} className="space-y-2">
                    <div>
                      <Label className="text-xs text-slate-700 font-medium block mb-1">{item.label}</Label>
                      <div className="flex gap-1.5">
                        <Input
                          value={settings[item.key] || ''}
                          onChange={(e) => updateSetting(item.key, e.target.value)}
                          placeholder={`URL or upload`}
                          className="h-8 text-sm border-slate-300 focus:border-purple-600 focus:ring-purple-600 flex-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => triggerFileInput(item.key)}
                          disabled={uploading[item.key]}
                          className="h-8 w-8 border-slate-300 hover:border-purple-600 hover:bg-purple-50"
                        >
                          {uploading[item.key] ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Upload className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </div>
                    {settings[item.key] && (
                      <div className={`${item.bg} border border-slate-200 rounded-lg p-3 flex items-center justify-center h-16 transition-all hover:shadow-sm`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={settings[item.key]} 
                          alt={item.label} 
                          className="max-h-full max-w-full object-contain transition-transform hover:scale-105" 
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-2" />

            {/* <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                Brand Colors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-700 font-medium">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Input
                        type="color"
                        value={settings.primary_color || '#004AAD'}
                        onChange={(e) => updateSetting('primary_color', e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border-0 shadow-sm p-0.5"
                      />
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white px-1.5 py-0.5 rounded border text-[10px] font-medium shadow-sm whitespace-nowrap">
                        Primary
                      </div>
                    </div>
                    <div className="flex-1">
                      <Input
                        value={settings.primary_color || '#004AAD'}
                        onChange={(e) => updateSetting('primary_color', e.target.value)}
                        placeholder="#004AAD"
                        className="h-8 text-sm border-slate-300 focus:border-purple-600 focus:ring-purple-600"
                      />
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: settings.primary_color || '#004AAD' }}></div>
                    <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: settings.primary_color || '#004AAD', opacity: 0.8 }}></div>
                    <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: settings.primary_color || '#004AAD', opacity: 0.6 }}></div>
                    <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: settings.primary_color || '#004AAD', opacity: 0.4 }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-slate-700 font-medium">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Input
                        type="color"
                        value={settings.secondary_color || '#FFC107'}
                        onChange={(e) => updateSetting('secondary_color', e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border-0 shadow-sm p-0.5"
                      />
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white px-1.5 py-0.5 rounded border text-[10px] font-medium shadow-sm whitespace-nowrap">
                        Secondary
                      </div>
                    </div>
                    <div className="flex-1">
                      <Input
                        value={settings.secondary_color || '#FFC107'}
                        onChange={(e) => updateSetting('secondary_color', e.target.value)}
                        placeholder="#FFC107"
                        className="h-8 text-sm border-slate-300 focus:border-purple-600 focus:ring-purple-600"
                      />
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: settings.secondary_color || '#FFC107' }}></div>
                    <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: settings.secondary_color || '#FFC107', opacity: 0.8 }}></div>
                    <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: settings.secondary_color || '#FFC107', opacity: 0.6 }}></div>
                    <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: settings.secondary_color || '#FFC107', opacity: 0.4 }}></div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}