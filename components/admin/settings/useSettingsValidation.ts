// components/admin/settings/useSettingsValidation.ts
import { useState, useCallback } from 'react';
import { SettingsData } from '@/lib/settingsApi';

export function useSettingsValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((key: string, value: string) => {
    const newErrors = { ...errors };
    
    // Clear error if field is valid
    if (isValidField(key, value)) {
      delete newErrors[key];
    } else {
      newErrors[key] = getValidationMessage(key, value);
    }
    
    setErrors(newErrors);
    return newErrors[key];
  }, [errors]);

  const validateSettings = useCallback((settings: SettingsData) => {
    const newErrors: Record<string, string> = {};
    
    Object.entries(settings).forEach(([key, setting]) => {
      if (!isValidField(key, setting.value)) {
        newErrors[key] = getValidationMessage(key, setting.value);
      }
    });
    
    setErrors(newErrors);
    return newErrors;
  }, []);

  return {
    errors,
    validateField,
    validateSettings,
    clearErrors: () => setErrors({})
  };
}

function isValidField(key: string, value: string): boolean {
  if (key.includes('email') && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  if (key.includes('url') && value) {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  if (key.includes('port') && value) {
    const port = parseInt(value, 10);
    return !isNaN(port) && port > 0 && port <= 65535;
  }

  if (key.includes('timeout') && value) {
    const timeout = parseInt(value, 10);
    return !isNaN(timeout) && timeout >= 0;
  }

  return true;
}

function getValidationMessage(key: string, value: string): string {
  if (key.includes('email')) {
    return 'Please enter a valid email address';
  }

  if (key.includes('url')) {
    return 'Please enter a valid URL';
  }

  if (key.includes('port')) {
    return 'Port must be between 1 and 65535';
  }

  if (key.includes('timeout')) {
    return 'Timeout must be a positive number';
  }

  return 'Invalid value';
}