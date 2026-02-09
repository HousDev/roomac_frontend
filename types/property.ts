export interface Room {
  id: string;
  name: string;
  floor: number;
  sharing: string;
  sharingType: number;
  available: number;
  ac: boolean;
  wifi: boolean;
  price: number;
  gender: 'male' | 'female' | 'any';
  occupancy: {
    male: number;
    female: number;
  };
  vacateDate?: string;
  status: 'available' | 'available-soon';
}

export interface PropertyManager {
  name: string;
  phone: string;
  avatar: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  icon: string;
  discount: string | null;
}

export interface Amenity {
  icon: string;
  title: string;
  description: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  recommended?: boolean;
}

export interface PropertyActivity {
  totalViews: number;
  shortlistedBy: number;
  contactRequests: {
    count: number;
    thisWeek: number;
  };
}

export interface NearbyPlace {
  name: string;
  distance: string;
  type: 'transport' | 'company' | 'shopping' | 'hospital' | 'restaurant' | 'entertainment';
  icon: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  roomType: string;
  stayDuration: string;
  verified: boolean;
  helpful: number;
}

export interface Property {
  id: string;
  name: string;
  location: string;
  address: string;
  images: string[];
  securityDeposit: number;
  offers: Offer[];
  tags: string[];
  rooms: Room[];
  amenities: Amenity[];
  pricingPlans: PricingPlan[];
  manager: PropertyManager;
  activity: PropertyActivity;
  coordinates: {
    lat: number;
    lng: number;
  };
  nearbyPlaces?: NearbyPlace[];
  description?: string;
  highlights?: string[];
  termsAndConditions?: string[];
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
}

export interface BookingFormData {
  fullName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female';
  moveInDate: string;
  sharingType: number;
  roomId: string;
  planId: string;
  couponCode?: string;
  agreeToTerms: boolean;
}
