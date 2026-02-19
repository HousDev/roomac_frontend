// components/properties/propertyTransformers.ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const getImageUrl = (imagePath: string | null | undefined) => {
  if (!imagePath) return "/placeholder-image.jpg";
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_URL}${imagePath}`;
};

// Helper function to get icon based on amenity name
const getIconForAmenity = (amenity: string): string => {
  const amenityLower = amenity.toLowerCase();
  
  if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return 'Wifi';
  if (amenityLower.includes('ac') || amenityLower.includes('air condition')) return 'Wind';
  if (amenityLower.includes('food') || amenityLower.includes('meal') || amenityLower.includes('restaurant') || amenityLower.includes('dining')) return 'Utensils';
  if (amenityLower.includes('security') || amenityLower.includes('cctv') || amenityLower.includes('safety')) return 'Shield';
  if (amenityLower.includes('power') || amenityLower.includes('backup') || amenityLower.includes('electricity')) return 'Zap';
  if (amenityLower.includes('parking') || amenityLower.includes('car') || amenityLower.includes('bike')) return 'Car';
  if (amenityLower.includes('gym') || amenityLower.includes('fitness') || amenityLower.includes('workout')) return 'Dumbbell';
  if (amenityLower.includes('tv') || amenityLower.includes('television') || amenityLower.includes('entertainment')) return 'Tv';
  if (amenityLower.includes('laundry') || amenityLower.includes('washing')) return 'Droplets';
  if (amenityLower.includes('lift') || amenityLower.includes('elevator')) return 'Building2';
  if (amenityLower.includes('water') || amenityLower.includes('purifier') || amenityLower.includes('filter')) return 'Droplets';
  if (amenityLower.includes('garden') || amenityLower.includes('terrace') || amenityLower.includes('balcony')) return 'Sun';
  if (amenityLower.includes('cleaning') || amenityLower.includes('housekeeping') || amenityLower.includes('maintenance')) return 'Bell';
  if (amenityLower.includes('bathroom') || amenityLower.includes('bath') || amenityLower.includes('washroom')) return 'Bath';
  if (amenityLower.includes('furniture') || amenityLower.includes('furnished')) return 'Home';
  if (amenityLower.includes('geyser') || amenityLower.includes('hot water')) return 'Thermometer';
  if (amenityLower.includes('locker') || amenityLower.includes('safe')) return 'Lock';
  if (amenityLower.includes('refrigerator') || amenityLower.includes('fridge')) return 'Coffee';
  if (amenityLower.includes('microwave') || amenityLower.includes('oven')) return 'Coffee';
  
  return 'Home';
};

// Helper function to get category based on amenity name
const getCategoryForAmenity = (amenity: string): string => {
  const amenityLower = amenity.toLowerCase();
  
  if (amenityLower.includes('wifi') || amenityLower.includes('internet') || 
      amenityLower.includes('tv') || amenityLower.includes('ac') ||
      amenityLower.includes('power') || amenityLower.includes('backup')) {
    return 'Technology';
  }
  if (amenityLower.includes('food') || amenityLower.includes('meal') || 
      amenityLower.includes('kitchen') || amenityLower.includes('restaurant') ||
      amenityLower.includes('dining') || amenityLower.includes('canteen')) {
    return 'Dining';
  }
  if (amenityLower.includes('gym') || amenityLower.includes('fitness') || 
      amenityLower.includes('pool') || amenityLower.includes('sports') ||
      amenityLower.includes('recreation') || amenityLower.includes('game')) {
    return 'Fitness';
  }
  if (amenityLower.includes('security') || amenityLower.includes('cctv') || 
      amenityLower.includes('guard') || amenityLower.includes('safety') ||
      amenityLower.includes('locker') || amenityLower.includes('safe')) {
    return 'Safety';
  }
  if (amenityLower.includes('parking') || amenityLower.includes('lift') || 
      amenityLower.includes('elevator') || amenityLower.includes('water') ||
      amenityLower.includes('purifier') || amenityLower.includes('geyser')) {
    return 'Facility';
  }
  if (amenityLower.includes('garden') || amenityLower.includes('terrace') || 
      amenityLower.includes('balcony') || amenityLower.includes('rooftop')) {
    return 'Outdoor';
  }
  if (amenityLower.includes('laundry') || amenityLower.includes('cleaning') || 
      amenityLower.includes('housekeeping') || amenityLower.includes('maintenance')) {
    return 'Services';
  }
  if (amenityLower.includes('furniture') || amenityLower.includes('furnished') ||
      amenityLower.includes('wardrobe') || amenityLower.includes('table') ||
      amenityLower.includes('chair') || amenityLower.includes('bed')) {
    return 'Furniture';
  }
  
  return 'Amenities';
};

// Helper function to format amenity name
const formatAmenityName = (amenity: string): string => {
  return amenity
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to parse terms and conditions from API
const parseTermsAndConditions = (property: any): string[] => {
  const terms: string[] = [];

  // Add property_rules if available
  if (property.property_rules) {
    if (typeof property.property_rules === 'string') {
      // Split by new lines or periods
      const rules = property.property_rules
        .split(/[.\n]+/)
        .map((rule: string) => rule.trim())
        .filter((rule: string) => rule.length > 0);
      terms.push(...rules);
    } else if (Array.isArray(property.property_rules)) {
      terms.push(...property.property_rules);
    }
  }

  // Add lock-in period terms
  if (property.lockin_period_months) {
    terms.push(`Minimum lock-in period of ${property.lockin_period_months} month${property.lockin_period_months > 1 ? 's' : ''} applies`);
  }

  // Add lock-in penalty terms
  if (property.lockin_penalty_amount && property.lockin_penalty_type) {
    if (property.lockin_penalty_type === 'fixed') {
      terms.push(`Early exit before lock-in: ₹${property.lockin_penalty_amount} penalty`);
    } else if (property.lockin_penalty_type === 'percentage') {
      terms.push(`Early exit before lock-in: ${property.lockin_penalty_amount}% of security deposit penalty`);
    }
  }

  // Add notice period terms
  if (property.notice_period_days) {
    terms.push(`${property.notice_period_days} days notice period required for vacating`);
  }

  // Add notice penalty terms
  if (property.notice_penalty_amount && property.notice_penalty_type) {
    if (property.notice_penalty_type === 'fixed') {
      terms.push(`Short notice: ₹${property.notice_penalty_amount} penalty`);
    } else if (property.notice_penalty_type === 'percentage') {
      terms.push(`Short notice: ${property.notice_penalty_amount}% of rent penalty`);
    }
  }

  // Add security deposit terms
  if (property.security_deposit) {
    terms.push(`Security deposit of ₹${property.security_deposit} is refundable subject to terms`);
  }

  // Add terms_conditions if available
  if (property.terms_conditions) {
    if (typeof property.terms_conditions === 'string') {
      const additionalTerms = property.terms_conditions
        .split(/[.\n]+/)
        .map((term: string) => term.trim())
        .filter((term: string) => term.length > 0);
      terms.push(...additionalTerms);
    } else if (Array.isArray(property.terms_conditions)) {
      terms.push(...property.terms_conditions);
    }
  }

  // Add additional_terms if available
  if (property.additional_terms) {
    if (typeof property.additional_terms === 'string') {
      const additionalTerms = property.additional_terms
        .split(/[.\n]+/)
        .map((term: string) => term.trim())
        .filter((term: string) => term.length > 0);
      terms.push(...additionalTerms);
    } else if (Array.isArray(property.additional_terms)) {
      terms.push(...property.additional_terms);
    }
  }

  // Add default terms if no terms were found
  if (terms.length === 0) {
    terms.push(
      "Minimum 3-month lock-in period for all bookings",
      "Security deposit refundable within 30 days of checkout",
      "1 month advance rent required at the time of booking",
      "Guests not allowed after 10 PM",
      "Smoking and alcohol strictly prohibited"
    );
  }

  return terms;
};

export const transformPropertyData = (property: any) => {
  const defaultImages = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800"
  ];

  // Transform amenities from API
  const transformedAmenities = (property.amenities || []).map((amenity: any, index: number) => {
    // If amenity is already an object with required properties
    if (typeof amenity === 'object' && amenity !== null) {
      const amenityName = amenity.name || amenity.title || 'Amenity';
      return {
        id: amenity.id || index,
        title: formatAmenityName(amenityName),
        icon: amenity.icon || getIconForAmenity(amenityName),
        category: amenity.category || getCategoryForAmenity(amenityName),
        description: amenity.description || `${formatAmenityName(amenityName)} available at the property`
      };
    }
    
    // If amenity is a string
    const amenityStr = String(amenity);
    return {
      id: index,
      title: formatAmenityName(amenityStr),
      icon: getIconForAmenity(amenityStr),
      category: getCategoryForAmenity(amenityStr),
      description: `${formatAmenityName(amenityStr)} available at the property`
    };
  });

  // If no amenities from API, use default amenities
  const finalAmenities = transformedAmenities.length > 0 ? transformedAmenities : [
    { icon: "Wifi", title: "High-Speed WiFi", description: "100+ Mbps", category: "Technology" },
    { icon: "Wind", title: "Air Conditioning", description: "In select rooms", category: "Technology" },
    { icon: "Utensils", title: "Meals Included", description: "3 times a day", category: "Dining" },
    { icon: "Shield", title: "Security", description: "24/7 CCTV", category: "Safety" },
    { icon: "Zap", title: "Power Backup", description: "Uninterrupted", category: "Technology" },
    { icon: "Home", title: "Housekeeping", description: "Daily service", category: "Services" },
    { icon: "Bath", title: "Attached Bathroom", description: "Hot water 24×7", category: "Facility" },
    { icon: "Car", title: "Parking", description: "Bike & car parking", category: "Facility" },
    { icon: "Building", title: "Lift", description: "All floors", category: "Facility" },
    { icon: "Dumbbell", title: "Gym", description: "Fully equipped", category: "Fitness" },
    { icon: "Coffee", title: "Common Kitchen", description: "Shared cooking area", category: "Dining" },
    { icon: "Tv", title: "Common TV", description: "Entertainment area", category: "Recreation" }
  ];

  // Parse terms and conditions from API
  const termsAndConditions = parseTermsAndConditions(property);

  return {
    name: property.name || "Luxury PG Accommodation",
    location: property.area || "Koramangala, Bangalore",
    address: property.address || "123 Main Street, Koramangala 5th Block, Bangalore - 560095",
    tags: property.tags || ["New Listing", "Premium", "Featured"],
    images: property.photo_urls && property.photo_urls.length > 0 
      ? property.photo_urls.map((url: string) => getImageUrl(url))
      : defaultImages,
    description: property.description || "Experience premium living in the heart of Koramangala.",
    highlights: property.services || property.highlights || [
      "24/7 Security & CCTV",
      "Housekeeping Service",
      "Power Backup",
      "High-Speed WiFi",
      "Nutritious Meals",
      "Gym & Recreation"
    ],
    securityDeposit: property.security_deposit || 3000,
    coordinates: property.coordinates || { lat: 12.9352, lng: 77.6245 },
    activity: {
      totalViews: property.total_views || 1248,
      shortlistedBy: property.shortlisted_by || 156,
      contactRequests: property.contact_requests || { count: 89, thisWeek: 12 }
    },
    // DYNAMIC AMENITIES FROM API
    amenities: finalAmenities,
    nearbyPlaces: property.nearby_places || [
      { name: "Metro Station", distance: "500m", type: "transport" },
      { name: "Tech Park", distance: "1.2km", type: "company" },
      { name: "Shopping Mall", distance: "800m", type: "shopping" },
      { name: "Hospital", distance: "1.5km", type: "hospital" },
      { name: "Restaurant", distance: "300m", type: "restaurant" },
      { name: "Cinema", distance: "900m", type: "entertainment" }
    ],
    pricingPlans: property.pricing_plans || [
      {
        id: "1",
        name: "1 Month",
        duration: "month",
        price: 8500,
        dailyRate: 283,
        recommended: false,
        features: ["Flexible stay", "No lock-in", "Full refund on deposit"]
      },
      {
        id: "2",
        name: "3 Months",
        duration: "3 months",
        price: 8000,
        dailyRate: 267,
        recommended: true,
        features: ["Save ₹500/month", "Priority support", "Free room transfer"]
      },
      {
        id: "3",
        name: "6 Months",
        duration: "6 months",
        price: 7500,
        dailyRate: 250,
        recommended: false,
        features: ["Save ₹1000/month", "VIP benefits", "Free upgrades"]
      }
    ],
    // DYNAMIC TERMS AND CONDITIONS FROM API
    termsAndConditions: termsAndConditions,
    manager: {
      name: property.property_manager_name || "Rajesh Kumar",
      phone: property.property_manager_phone || "+919876543210",
      email: property.property_manager_email || "rajesh@example.com",
      role: property.property_manager_role || "Verified Manager",
      avatar: property.property_manager_avatar || "https://i.pravatar.cc/150?img=12",
      rating: property.manager_rating || 4.8
    },
    reviews: property.reviews || [
      {
        id: "1",
        userName: "Priya Sharma",
        userAvatar: "https://i.pravatar.cc/150?img=1",
        rating: 5,
        date: "2025-12-15",
        comment: "Amazing place! Very clean and well-maintained. The food is delicious and the staff is very cooperative. Highly recommended!",
        roomType: "2 Sharing",
        stayDuration: "6 months",
        verified: true,
        helpful: 24
      }
    ],
    averageRating: property.rating || 4.8,
    totalReviews: property.total_reviews || 60,
    isFeatured: property.is_featured || true,
    totalBeds: property.total_beds || 20,
    occupiedBeds: property.occupied_beds || 15,
    dailyRate: property.daily_rate || 500,
    startingPrice: property.starting_price || 5500,
    id: property.id,
    
    // Add these fields for reference in other parts
    lockinPeriodMonths: property.lockin_period_months,
    lockinPenaltyAmount: property.lockin_penalty_amount,
    lockinPenaltyType: property.lockin_penalty_type,
    noticePeriodDays: property.notice_period_days,
    noticePenaltyAmount: property.notice_penalty_amount,
    noticePenaltyType: property.notice_penalty_type,
    propertyRules: property.property_rules,
    termsConditions: property.terms_conditions,
    additionalTerms: property.additional_terms
  };
};

export const transformRoomData = (room: any) => {
  let gender = 'mixed';
  if (room.room_gender_preference && Array.isArray(room.room_gender_preference)) {
    const prefs = room.room_gender_preference.map((p: string) => p.toLowerCase());
    if (prefs.includes('male') && !prefs.includes('female')) {
      gender = 'male';
    } else if (prefs.includes('female') && !prefs.includes('male')) {
      gender = 'female';
    }
  }

  const totalBeds = room.total_bed || 0;
  const occupiedBeds = room.occupied_beds || 0;
  const availableBeds = totalBeds - occupiedBeds;
  
  let status = 'available';
  if (availableBeds === 0) {
    status = 'occupied';
  } else if (availableBeds < totalBeds) {
    status = 'partially-available';
  }

  let maleOccupancy = 0;
  let femaleOccupancy = 0;
  
  if (room.bed_assignments && Array.isArray(room.bed_assignments)) {
    room.bed_assignments.forEach((bed: any) => {
      if (bed.tenant_gender === 'Male' || bed.tenant_gender === 'male') maleOccupancy++;
      if (bed.tenant_gender === 'Female' || bed.tenant_gender === 'female') femaleOccupancy++;
    });
  }

  const sharingType = parseInt(room.sharing_type) || 2;
  const price = room.rent_per_bed || 5000;
  const ac = room.has_ac === true || room.has_ac === 'true';
  
  return {
    id: room.id.toString(),
    name: room.room_number || `Room ${room.id}`,
    sharingType: sharingType,
    price: price,
    floor: room.floor || 1,
    room_gender_preference: room.room_gender_preference,
    gender: gender,
    ac: ac,
    wifi: room.has_wifi || true,
    available: availableBeds,
    totalBeds: totalBeds,
    occupiedBeds: occupiedBeds,
    occupancy: {
      male: maleOccupancy,
      female: femaleOccupancy
    },
    status: status,
    amenities: room.amenities || [],
    description: room.description || '',
    roomType: room.room_type || 'Standard',
    hasAttachedBathroom: room.has_attached_bathroom || false,
    hasBalcony: room.has_balcony || false,
    allowCouples: room.allow_couples || false,
    isActive: room.is_active || true,
    bedAssignments: room.bed_assignments || []
  };
};