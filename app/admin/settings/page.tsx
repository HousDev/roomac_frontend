


// app/admin/settings/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getSettings, updateSettings, uploadFile, SettingsData } from '@/lib/settingsApi';
import SettingsLayout from '@/components/admin/settings/SettingsLayout';
import GeneralSettings from '@/components/admin/settings/GeneralSettings';
import BrandingSettings from '@/components/admin/settings/BrandingSettings';
import SMSSettings from '@/components/admin/settings/SMSSettings';
import EmailSettings from '@/components/admin/settings/EmailSettings';
import PaymentSettings from '@/components/admin/settings/PaymentSettings';
import NotificationSettings from '@/components/admin/settings/NotificationSettings';
import AdvancedSettings from '@/components/admin/settings/AdvancedSettings';
import SaveSettingsBar from '@/components/admin/settings/SaveSettingsBar';
import LoadingSkeleton from '@/components/admin/settings/LoadingSkeleton';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      setSettingsData(data);
      
      const settingsValues: Record<string, any> = {};
      Object.entries(data).forEach(([key, settingData]) => {
        settingsValues[key] = settingData.value;
      });
      setSettings(settingsValues);
      
      // toast.success('Settings loaded successfully');
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast.error(error.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateSettings(settings);
      
      if (result.success) {
        toast.success(result.message || 'Settings saved successfully', {
          description: 'Your settings have been updated',
        });
        await loadSettings();
      } else {
        toast.error(result.message || 'Failed to save settings');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (key: string, file: File) => {
    setUploading(prev => ({ ...prev, [key]: true }));
    try {
      const result = await uploadFile(file, 'logos', key);
      
      if (result.success && result.url) {
        updateSetting(key, result.url);
        toast.success(result.message || 'Logo uploaded successfully', {
          description: 'Image has been uploaded and saved',
        });
      } else {
        toast.error(result.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload logo');
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const testConnection = async (type: 'sms' | 'email' | 'payment') => {
    toast.info(`Testing ${type} connection...`);
    // Implement test functionality here
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <SettingsLayout title="Settings" description="Manage your platform configuration">
      <GeneralSettings 
        settings={settings}
        updateSetting={updateSetting}
      />
      
      <BrandingSettings 
        settings={settings}
        updateSetting={updateSetting}
        uploading={uploading}
        handleFileUpload={handleFileUpload}
      />
      
      <SMSSettings 
        settings={settings}
        updateSetting={updateSetting}
        showSecrets={showSecrets}
        toggleSecretVisibility={toggleSecretVisibility}
        testConnection={testConnection}
      />
      
      <EmailSettings 
        settings={settings}
        updateSetting={updateSetting}
        showSecrets={showSecrets}
        toggleSecretVisibility={toggleSecretVisibility}
        testConnection={testConnection}
      />
      
      <PaymentSettings 
        settings={settings}
        updateSetting={updateSetting}
        showSecrets={showSecrets}
        toggleSecretVisibility={toggleSecretVisibility}
        testConnection={testConnection}
      />
      
      <NotificationSettings 
        settings={settings}
        updateSetting={updateSetting}
      />
      
      <AdvancedSettings 
        settings={settings}
        updateSetting={updateSetting}
      />

      <SaveSettingsBar 
        saving={saving}
        onSave={handleSave}
        onReset={() => {
          const settingsValues: Record<string, any> = {};
          Object.entries(settingsData!).forEach(([key, settingData]) => {
            settingsValues[key] = settingData.value;
          });
          setSettings(settingsValues);
          toast.info('Changes reset to saved values');
        }}
      />
    </SettingsLayout>
  );
}