

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const getImageUrl = (imagePath: string | null | undefined) => {
  if (!imagePath) return "/placeholder-image.jpg";
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_URL}${imagePath}`;
};

export const transformPropertyData = (property: any) => {
  const defaultImages = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800"
  ];
  
  
  
  // Construct avatar URL
  const avatarUrl = property.manager_photo_url
    ? `${API_URL}/uploads/staff-documents/${property.manager_photo_url.replace(/^\//, '')}`
    : `${API_URL}/uploads/staff/default.png`;
  
  
  // Test fetch if in browser
  

  return {
    name: property.name || "Luxury PG Accommodation",
    location: property.area || "Koramangala, Bangalore",
    address: property.address || "123 Main Street, Koramangala 5th Block, Bangalore - 560095",
    tags: ["New Listing", "Premium", "Featured"],
    images: property.photo_urls && property.photo_urls.length > 0 
      ? property.photo_urls.map((url: string) => getImageUrl(url))
      : defaultImages,
    description: property.description || "Experience premium living in the heart of Koramangala.",
    highlights: property.services || [
      "24/7 Security & CCTV",
      "Housekeeping Service",
      "Power Backup",
      "High-Speed WiFi",
      "Nutritious Meals",
      "Gym & Recreation"
    ],
    securityDeposit: property.security_deposit || 3000,
    coordinates: { lat: 12.9352, lng: 77.6245 },
    activity: {
      totalViews: 1248,
      shortlistedBy: 156,
      contactRequests: { count: 89, thisWeek: 12 }
    },
    amenities: [
      { icon: "Wifi", title: "High-Speed WiFi", description: "100+ Mbps", category: "connectivity" },
      { icon: "Wind", title: "Air Conditioning", description: "In select rooms", category: "comfort" },
      { icon: "Utensils", title: "Meals Included", description: "3 times a day", category: "food" },
      { icon: "Shield", title: "Security", description: "24/7 CCTV", category: "safety" },
      { icon: "Zap", title: "Power Backup", description: "Uninterrupted", category: "infrastructure" },
      { icon: "Home", title: "Housekeeping", description: "Daily service", category: "services" },
      { icon: "Bath", title: "Attached Bathroom", description: "Hot water 24×7", category: "comfort" },
      { icon: "Car", title: "Parking", description: "Bike & car parking", category: "infrastructure" },
      { icon: "Building", title: "Lift", description: "All floors", category: "accessibility" },
      { icon: "Dumbbell", title: "Gym", description: "Fully equipped", category: "recreation" },
      { icon: "Coffee", title: "Common Kitchen", description: "Shared cooking area", category: "food" },
      { icon: "Tv", title: "Common TV", description: "Entertainment area", category: "recreation" }
    ],
    nearbyPlaces: [
      { name: "Metro Station", distance: "500m", type: "transport" },
      { name: "Tech Park", distance: "1.2km", type: "company" },
      { name: "Shopping Mall", distance: "800m", type: "shopping" },
      { name: "Hospital", distance: "1.5km", type: "hospital" },
      { name: "Restaurant", distance: "300m", type: "restaurant" },
      { name: "Cinema", distance: "900m", type: "entertainment" }
    ],
    pricingPlans: [
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
    termsAndConditions: [
      "Minimum 3-month lock-in period for all bookings",
      "Security deposit refundable within 30 days of checkout",
      "1 month advance rent required at the time of booking",
      "Guests not allowed after 10 PM",
      "Smoking and alcohol strictly prohibited"
    ],
    manager: {
      name: property.property_manager_name || "Rajesh Kumar",
      phone: property.property_manager_phone || "+919876543210",
      email: property.property_manager_email || "rajesh@example.com",
      role: property.property_manager_role || "Verified Manager",
      avatar: avatarUrl,  // Using the constructed URL with debug
      rating: 4.8
    },
    
    reviews: [
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
    totalReviews: 60,
    isFeatured: true,
    totalBeds: property.total_beds || 20,
    occupiedBeds: property.occupied_beds || 15,
    dailyRate: 500,
    startingPrice: property.starting_price || 5500,
    id: property.id
  };
};

export const transformRoomData = (room: any) => {
  // console.log("🔄 Transforming room data:", room);
  
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
  
  const transformedRoom = {
    id: room.id.toString(),
    name: room.room_number || `Room ${room.id}`,
    sharingType: sharingType,
    price: price,
    floor: room.floor || 1,
    room_gender_preference: room.room_gender_preference,
    gender: gender,
    ac: ac,
    wifi: true,
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
  
  // console.log(`✅ Transformed room ${room.id}:`, transformedRoom);
  return transformedRoom;
};