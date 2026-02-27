// lib/slugUtils.ts
import { v4 as uuidv4 } from 'uuid'; // Install: npm install uuid @types/uuid

export function generatePropertySlug(property: {
  name: string;
  area?: string | null;
  city?: string | null;
  id: string | number;
}): string {
  
  const nameSlug = property.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 50);

  const locationParts = [];
  
  if (property.area && property.area !== 'null' && property.area.trim() !== '') {
    locationParts.push(property.area.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, ''));
  }
  
  if (property.city && property.city !== 'null' && property.city.trim() !== '') {
    locationParts.push(property.city.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, ''));
  }

  const components = [nameSlug];
  
  if (locationParts.length > 0) {
    components.push(...locationParts);
  } else {
    components.push('pg');
  }
  
  components.push(property.id.toString());

  return components.join('-');
}

export function extractIdFromSlug(slug: string): string | null {
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  
  if (/^\d+$/.test(lastPart)) {
    return lastPart;
  }
  
  return null;
}

// Generate a unique tracking ID (like the tf parameter)
export function generateTrackingId(): string {
  return uuidv4();
}

// Store or retrieve tracking ID from localStorage/session
export function getOrCreateTrackingId(propertyId: string | number): string {
  const storageKey = `property_tracking_${propertyId}`;
  let trackingId = localStorage.getItem(storageKey);
  
  if (!trackingId) {
    trackingId = generateTrackingId();
    localStorage.setItem(storageKey, trackingId);
  }
  
  return trackingId;
}