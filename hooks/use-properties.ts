

import { listProperties, getProperty, Property } from '@/lib/propertyApi';
import { useEffect, useState } from 'react';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);

      const result = await listProperties();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to load properties');
      }

      // 👇 THIS is the key line
      setProperties(result.data.data);

      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { properties, loading, error, refetch: loadProperties };
}
