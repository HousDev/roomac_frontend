import { useEffect, useState } from 'react';

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      console.log("res",response)
      const result = await response.json();

      if (result.success) {
        const settingsValues: Record<string, string> = {};
        Object.entries(result.data).forEach(([key, data]: [string, any]) => {
          settingsValues[key] = data.value || '';
        });
        setSettings(settingsValues);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, refresh: loadSettings };
}
