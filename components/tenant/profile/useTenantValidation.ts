import { useState, useCallback } from 'react';
import { TenantFormData } from '@/lib/tenantDetailsApi';

export function useTenantValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((field: keyof TenantFormData, value: string) => {
    const newErrors = { ...errors };
    
    if (isValidField(field, value)) {
      delete newErrors[field];
    } else {
      newErrors[field] = getValidationMessage(field, value);
    }
    
    setErrors(newErrors);
    return newErrors[field];
  }, [errors]);

  const validateProfile = useCallback((formData: TenantFormData) => {
    const newErrors: Record<string, string> = {};
    
    Object.entries(formData).forEach(([field, value]) => {
      if (!isValidField(field as keyof TenantFormData, value)) {
        newErrors[field] = getValidationMessage(field as keyof TenantFormData, value);
      }
    });
    
    setErrors(newErrors);
    return newErrors;
  }, []);

  return {
    errors,
    validateField,
    validateProfile,
    clearErrors: () => setErrors({})
  };
}

function isValidField(field: keyof TenantFormData, value: string): boolean {
  // Required fields validation
  const requiredFields: (keyof TenantFormData)[] = [
    'full_name', 'phone', 'country_code', 'gender', 
    'occupation', 'occupation_category', 'address', 
    'city', 'state', 'pincode'
  ];

  if (requiredFields.includes(field) && !value.trim()) {
    return false;
  }

  // Specific field validations
  if (field === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  if (field === 'phone') {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(value.replace(/\D/g, ''));
  }

  if (field === 'pincode') {
    const pincodeRegex = /^[0-9]{6}$/;
    return pincodeRegex.test(value);
  }

  if (field === 'date_of_birth' && value) {
    const dob = new Date(value);
    const today = new Date();
    return dob < today && dob > new Date('1900-01-01');
  }

  return true;
}

function getValidationMessage(field: keyof TenantFormData, value: string): string {
  const requiredFields: (keyof TenantFormData)[] = [
    'full_name', 'phone', 'country_code', 'gender', 
    'occupation', 'occupation_category', 'address', 
    'city', 'state', 'pincode'
  ];

  if (requiredFields.includes(field) && !value.trim()) {
    return `${field.replace('_', ' ')} is required`;
  }

  switch (field) {
    case 'email':
      return 'Please enter a valid email address';
    case 'phone':
      return 'Please enter a valid 10-digit phone number';
    case 'pincode':
      return 'Please enter a valid 6-digit pincode';
    case 'date_of_birth':
      return 'Please enter a valid date of birth';
    default:
      return 'Invalid value';
  }
}