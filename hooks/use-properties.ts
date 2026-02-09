// import { useState, useEffect } from 'react';
// import { getProperties, getPropertyById } from '@/lib/api';
// import { Property } from '@/types';

// export function useProperties() {
//   const [properties, setProperties] = useState<Property[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<Error | null>(null);

//   useEffect(() => {
//     loadProperties();
//   }, []);

//   const loadProperties = async () => {
//     try {
//       setLoading(true);
//       const data = await getProperties();
//       setProperties(data);
//       setError(null);
//     } catch (err) {
//       setError(err as Error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { properties, loading, error, refetch: loadProperties };
// }

// export function useProperty(id: string) {
//   const [property, setProperty] = useState<Property | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<Error | null>(null);

//   useEffect(() => {
//     if (id) {
//       loadProperty();
//     }
//   }, [id]);

//   const loadProperty = async () => {
//     try {
//       setLoading(true);
//       const data = await getPropertyById(id);
//       setProperty(data);
//       setError(null);
//     } catch (err) {
//       setError(err as Error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { property, loading, error, refetch: loadProperty };
// }

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
