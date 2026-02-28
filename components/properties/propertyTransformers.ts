// components/properties/propertyTransformers.ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const toArray = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [val];
    } catch {
      return val.split('\n').filter(Boolean);
    }
  }
  return [];
};

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

  // Extract tags from property
  let propertyTags: string[] = [];
  
  if (property.tags && Array.isArray(property.tags)) {
    propertyTags = property.tags;
  } else if (property.property_tags && Array.isArray(property.property_tags)) {
    propertyTags = property.property_tags;
  } else if (property.category_tags && Array.isArray(property.category_tags)) {
    propertyTags = property.category_tags;
  } else if (property.labels && Array.isArray(property.labels)) {
    propertyTags = property.labels;
  } else if (property.tag_list && Array.isArray(property.tag_list)) {
    propertyTags = property.tag_list;
  }
  
  const nearbyNames = property.nearbyPlaces?.map((p: any) => p.name) || [];

  // Log raw data for debugging
  console.log('Raw property terms data:', {
    terms_conditions: property.terms_conditions,
    property_rules: property.property_rules,
    additional_terms: property.additional_terms,
    terms_json: property.terms_json
  });

  // Parse property_rules - these come from MultiSelect in Photos tab
  let propertyRules = [];
  if (property.property_rules) {
    try {
      propertyRules = typeof property.property_rules === 'string' 
        ? JSON.parse(property.property_rules) 
        : property.property_rules;
      
      // Ensure it's an array
      if (!Array.isArray(propertyRules)) {
        propertyRules = [propertyRules];
      }
    } catch (e) {
      // If not JSON, treat as array of strings
      propertyRules = Array.isArray(property.property_rules) 
        ? property.property_rules 
        : [property.property_rules];
    }
  }

  // Parse additional_terms - these come from MultiSelect in Photos tab
  let additionalTerms = [];
  if (property.additional_terms) {
    try {
      additionalTerms = typeof property.additional_terms === 'string'
        ? JSON.parse(property.additional_terms)
        : property.additional_terms;
      
      // Ensure it's an array
      if (!Array.isArray(additionalTerms)) {
        additionalTerms = [additionalTerms];
      }
    } catch (e) {
      // If not JSON, treat as array of strings
      additionalTerms = Array.isArray(property.additional_terms) 
        ? property.additional_terms 
        : [property.additional_terms];
    }
  }

  // Parse terms_conditions - this comes from the Terms tab with template format
  let generalTerms = [];
  let customTerms = []; // For custom terms added by user with 📝 header
  
  if (property.terms_conditions) {
    // Split by double newlines to separate sections
    const sections = property.terms_conditions.split('\n\n');
    console.log('Sections:', sections);
    
    for (const section of sections) {
      const lines = section.split('\n').filter(line => line.trim() !== '');
      if (lines.length === 0) continue;
      
      // Get the first line which might be a header
      const firstLine = lines[0].trim();
      console.log('Processing section with header:', firstLine);
      
      // Check if this is a Custom Term section
      if (firstLine.includes('📝 Custom Term')) {
        console.log('Found Custom Term section');
        // This is a custom term section - extract everything after the header
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line && !line.includes('📝')) {
            console.log('Adding custom term:', line);
            customTerms.push(line);
          }
        }
      } 
      // Template sections with emoji headers (Lock-in, Notice, etc.)
      else if (firstLine.includes('🔒') || firstLine.includes('📅') || firstLine.includes('💰') || 
               firstLine.includes('⚠️') || firstLine.includes('⚡') || firstLine.includes('🔧') ||
               firstLine.includes('📋') || firstLine.includes('💵') || firstLine.includes('🏢') ||
               firstLine.includes('🧾')) {
        console.log('Found template section:', firstLine);
        // This is a template section - extract numbered items
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line && line.match(/^\d+\./)) {
            // Remove the number and add to general terms
            generalTerms.push(line.replace(/^\d+\.\s*/, ''));
          }
        }
      } 
      // For any other format, check if it's a numbered item or custom content
      else {
        console.log('Found other section:', firstLine);
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.match(/^\d+\./)) {
            generalTerms.push(trimmedLine.replace(/^\d+\.\s*/, ''));
          } else if (trimmedLine && !trimmedLine.includes('📝') && !trimmedLine.includes('🔒') && 
                     !trimmedLine.includes('📅') && !trimmedLine.includes('💰') &&
                     !trimmedLine.includes('⚠️') && !trimmedLine.includes('⚡') && 
                     !trimmedLine.includes('🔧') && !trimmedLine.includes('📋') && 
                     !trimmedLine.includes('💵') && !trimmedLine.includes('🏢') && 
                     !trimmedLine.includes('🧾')) {
            // Treat as custom term if it's not empty and not a header
            console.log('Adding as custom term (other):', trimmedLine);
            customTerms.push(trimmedLine);
          }
        }
      }
    }
    
    // Fallback: If still no custom terms found, try a direct approach
    if (customTerms.length === 0 && property.terms_conditions.includes('📝 Custom Term')) {
      console.log('Using fallback extraction for custom terms');
      const lines = property.terms_conditions.split('\n');
      let foundCustomSection = false;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.includes('📝 Custom Term')) {
          foundCustomSection = true;
          continue;
        }
        
        if (foundCustomSection && trimmedLine && !trimmedLine.includes('📝') && 
            !trimmedLine.match(/^\d+\./)) {
          console.log('Fallback adding custom term:', trimmedLine);
          customTerms.push(trimmedLine);
          break; // Only take the first line after the header
        }
      }
    }
  }
  
  // If still no general terms, try terms_json as fallback
  if (generalTerms.length === 0 && property.terms_json) {
    try {
      const parsed = typeof property.terms_json === 'string' 
        ? JSON.parse(property.terms_json) 
        : property.terms_json;
      
      if (Array.isArray(parsed)) {
        generalTerms = parsed.map((item: any) => 
          typeof item === 'object' ? (item.text || item.content || JSON.stringify(item)) : item
        );
      }
    } catch (e) {
      console.error('Error parsing terms_json:', e);
    }
  }

  console.log('Transformed terms:', {
    generalTerms,
    propertyRules,
    additionalTerms,
    customTerms
  });

  return {
    name: property.name || "Luxury PG Accommodation",
    location: property.area || "Koramangala, Bangalore",
    area: property.area,
    city: property.city,
    address: property.address || "123 Main Street, Koramangala 5th Block, Bangalore - 560095",
    property_type: property.property_type || "PG",
    nearby_places: property.nearbyPlaces || [],
    nearby_names: nearbyNames,
    tags: propertyTags,
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

    // Now properly separated based on your form structure
    propertyRules: propertyRules, // From MultiSelect in Photos tab
    additionalTerms: additionalTerms, // From MultiSelect in Photos tab
    termsAndConditions: generalTerms, // Numbered items from template sections in Terms tab
    customTerms: customTerms, // Custom terms from the "📝 Custom Term" section in Terms tab

    manager: (() => {
      const salutationMap: Record<string, string> = {
        mr: 'Mr.', mrs: 'Mrs.', miss: 'Miss', dr: 'Dr.', prof: 'Prof.'
      };
      const salutation = property.manager_salutation
        ? (salutationMap[property.manager_salutation.toLowerCase()] || '')
        : '';

      const managerName = property.staff_id 
        ? (property.staff_name || property.property_manager_name || "Manager")
        : (property.property_manager_name || "Manager");
      
      const managerPhone = property.staff_id
        ? (property.staff_phone || property.property_manager_phone || "")
        : (property.property_manager_phone || "");

      const managerEmail = property.staff_id
        ? (property.staff_email || property.property_manager_email || "")
        : (property.property_manager_email || "");

      const rawRole = property.staff_id
        ? (property.staff_role || property.property_manager_role || "Manager")
        : (property.property_manager_role || "Manager");

      const formattedRole = rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();

      return {
        name: salutation ? `${salutation} ${managerName}` : managerName,
        phone: managerPhone,
        email: managerEmail,
        role: formattedRole,
        avatar: avatarUrl,
        rating: 4.8
      };
    })(),
    
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
};