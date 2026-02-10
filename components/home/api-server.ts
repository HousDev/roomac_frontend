// lib/api-server.ts
const API_URL = process.env.VITE_API_URL || 'http://localhost:3001';

const FETCH_TIMEOUT_MS = 3500; // 3.5 sec - page loads fast even if backend is slow/down

function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number } = {}): Promise<Response> {
  const { timeout = FETCH_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...fetchOptions, signal: controller.signal }).finally(() => clearTimeout(id));
}

export async function fetchCities() {
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/cities`, {
      cache: 'force-cache',
      next: { revalidate: 3600 },
      timeout: FETCH_TIMEOUT_MS
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
}

export async function fetchProperties() {
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/properties`, {
      cache: 'no-store',
      timeout: FETCH_TIMEOUT_MS
    });
    if (!res.ok) return [];
    const data = await res.json();
    
    let propertiesArray = [];
    
    if (Array.isArray(data)) {
      propertiesArray = data;
    } else if (data.data && Array.isArray(data.data)) {
      propertiesArray = data.data;
    } else if (data.properties && Array.isArray(data.properties)) {
      propertiesArray = data.properties;
    } else if (data.success && data.data && Array.isArray(data.data)) {
      propertiesArray = data.data;
    }
    
    return propertiesArray
      .filter((prop: any) => prop.is_active !== false)
      .slice(0, 6);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

export async function fetchOffers() {
  try {
    const { offerApi } = await import('@/lib/offerApi');
    const data = await Promise.race([
      offerApi.getAll(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Offers fetch timeout')), FETCH_TIMEOUT_MS)
      )
    ]);
    return data.filter((offer: any) =>
      offer.is_active !== false &&
      offer.is_active !== 0 &&
      offer.is_active !== 'false'
    );
  } catch (error) {
    console.error('Error fetching offers:', error);
    return [];
  }
}