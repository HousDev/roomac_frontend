// "use client";

// import { useState, useMemo, useEffect } from 'react';
// import { useParams } from 'next/navigation';
// import { listProperties, getProperty, type Property } from "@/lib/propertyApi";
// import { listRoomsByProperty, type RoomResponse } from "@/lib/roomsApi";
// import { offerApi, type Offer } from "@/lib/offerApi";

// import {
//   MapPin, Share2, Star, IndianRupee, CheckCircle2, Shield, Eye, Heart, MessageSquare,
//   ChevronLeft, ChevronRight, X, Image as ImageIcon, FileText, Sparkles,
//   Home, User, Users, Wind, Wifi, Building2, Bus, ShoppingCart, Utensils,
//   Film, Tag, Percent, Clock, Gift, Zap, Check, Crown, Phone, Mail, Calendar,
//   CreditCard, Filter, Search, CalendarDays, Bed, ShieldCheck, Dumbbell,
//   Tv, Thermometer, Droplets, Volume2, Lock, Bell, Cloud, Sun, Moon,
//   Battery, Radio, Router, Bath, Car, Building, AlertCircle, FileCheck,
//   ThumbsUp, TrendingUp, Award, SlidersHorizontal, ArrowRight, ChevronDown,
//   Maximize2, Coffee as CoffeeIcon, Bath as BathIcon, Coffee
// } from 'lucide-react';

// const API_URL = process.env.VITE_API_URL || "http://localhost:3001";

// const Icons = {
//   Wifi, Wind, Utensils, Shield, Zap, Home, Building2, Bus, ShoppingCart, Heart, Film,
//   Bath, Car, Building, Dumbbell, Coffee, Tv, Thermometer, Droplets, Volume2, Lock,
//   Bell, Cloud, Sun, Moon, Battery, Radio, Router,
//   tag: Tag, percent: Percent, clock: Clock, gift: Gift, transport: Bus, company: Building2,
//   shopping: ShoppingCart, hospital: Heart, restaurant: Utensils, entertainment: Film
// };

// // Helper function to get complete image URL
// const getImageUrl = (imagePath: string | null | undefined) => {
//   if (!imagePath) return "/placeholder-image.jpg";
//   if (imagePath.startsWith('http')) return imagePath;
  
//   return `${API_URL}${imagePath}`;
// };

// // Transform API property data to match component structure
// const transformPropertyData = (property: Property) => {
//   // Default images if none provided
//   const defaultImages = [
//     "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
//     "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
//     "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
//     "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800"
//   ];

//   return {
//     name: property.name || "Luxury PG Accommodation",
//     location: property.area || "Koramangala, Bangalore",
//     address: property.address || "123 Main Street, Koramangala 5th Block, Bangalore - 560095",
//     tags: ["New Listing", "Premium", "Featured"],
//     images: property.photo_urls && property.photo_urls.length > 0 
//       ? property.photo_urls.map(url => getImageUrl(url))
//       : defaultImages,
//     description: property.description || "Experience premium living in the heart of Koramangala. Our fully furnished PG offers modern amenities, spacious rooms, and a vibrant community atmosphere perfect for students and working professionals.",
//     highlights: property.services || [
//       "24/7 Security & CCTV",
//       "Housekeeping Service",
//       "Power Backup",
//       "High-Speed WiFi",
//       "Nutritious Meals",
//       "Gym & Recreation"
//     ],
//     securityDeposit: property.security_deposit || 3000,
//     coordinates: { lat: 12.9352, lng: 77.6245 },
//     activity: {
//       totalViews: 1248,
//       shortlistedBy: 156,
//       contactRequests: { count: 89, thisWeek: 12 }
//     },
//     rooms: [],
//     amenities: [
//       { icon: "Wifi", title: "High-Speed WiFi", description: "100+ Mbps", category: "connectivity" },
//       { icon: "Wind", title: "Air Conditioning", description: "In select rooms", category: "comfort" },
//       { icon: "Utensils", title: "Meals Included", description: "3 times a day", category: "food" },
//       { icon: "Shield", title: "Security", description: "24/7 CCTV", category: "safety" },
//       { icon: "Zap", title: "Power Backup", description: "Uninterrupted", category: "infrastructure" },
//       { icon: "Home", title: "Housekeeping", description: "Daily service", category: "services" },
//       { icon: "Bath", title: "Attached Bathroom", description: "Hot water 24×7", category: "comfort" },
//       { icon: "Car", title: "Parking", description: "Bike & car parking", category: "infrastructure" },
//       { icon: "Building", title: "Lift", description: "All floors", category: "accessibility" },
//       { icon: "Dumbbell", title: "Gym", description: "Fully equipped", category: "recreation" },
//       { icon: "Coffee", title: "Common Kitchen", description: "Shared cooking area", category: "food" },
//       { icon: "Tv", title: "Common TV", description: "Entertainment area", category: "recreation" }
//     ],
//     nearbyPlaces: [
//       { name: "Metro Station", distance: "500m", type: "transport" },
//       { name: "Tech Park", distance: "1.2km", type: "company" },
//       { name: "Shopping Mall", distance: "800m", type: "shopping" },
//       { name: "Hospital", distance: "1.5km", type: "hospital" },
//       { name: "Restaurant", distance: "300m", type: "restaurant" },
//       { name: "Cinema", distance: "900m", type: "entertainment" }
//     ],
//     pricingPlans: [
//       {
//         id: "1",
//         name: "1 Month",
//         duration: "month",
//         price: 8500,
//         dailyRate: 283,
//         recommended: false,
//         features: ["Flexible stay", "No lock-in", "Full refund on deposit"]
//       },
//       {
//         id: "2",
//         name: "3 Months",
//         duration: "3 months",
//         price: 8000,
//         dailyRate: 267,
//         recommended: true,
//         features: ["Save ₹500/month", "Priority support", "Free room transfer"]
//       },
//       {
//         id: "3",
//         name: "6 Months",
//         duration: "6 months",
//         price: 7500,
//         dailyRate: 250,
//         recommended: false,
//         features: ["Save ₹1000/month", "VIP benefits", "Free upgrades"]
//       }
//     ],
//     termsAndConditions: [
//       "Minimum 3-month lock-in period for all bookings",
//       "Security deposit refundable within 30 days of checkout",
//       "1 month advance rent required at the time of booking",
//       "Guests not allowed after 10 PM",
//       "Smoking and alcohol strictly prohibited"
//     ],
//     manager: {
//       name: property.property_manager_name || "Rajesh Kumar",
//       phone: property.property_manager_phone || "+919876543210",
//       email: "rajesh@example.com",
//       avatar: "https://i.pravatar.cc/150?img=12",
//       rating: 4.8
//     },
//     reviews: [
//       {
//         id: "1",
//         userName: "Priya Sharma",
//         userAvatar: "https://i.pravatar.cc/150?img=1",
//         rating: 5,
//         date: "2025-12-15",
//         comment: "Amazing place! Very clean and well-maintained. The food is delicious and the staff is very cooperative. Highly recommended!",
//         roomType: "2 Sharing",
//         stayDuration: "6 months",
//         verified: true,
//         helpful: 24
//       },
//       {
//         id: "2",
//         userName: "Amit Patel",
//         userAvatar: "https://i.pravatar.cc/150?img=3",
//         rating: 4,
//         date: "2025-11-28",
//         comment: "Good location and facilities. WiFi speed is excellent. Only minor issue is parking space during peak hours.",
//         roomType: "3 Sharing",
//         stayDuration: "4 months",
//         verified: true,
//         helpful: 18
//       }
//     ],
//     averageRating: property.rating || 4.8,
//     totalReviews: 60,
//     isFeatured: true,
//     totalBeds: property.total_beds || 20,
//     occupiedBeds: property.occupied_beds || 15,
//     dailyRate: 500,
//     startingPrice: property.starting_price || 5500,
//     id: property.id
//   };
// };

// // Transform API room data to match component structure
// const transformRoomData = (room: RoomResponse) => {
//   console.log("🔄 Transforming room data:", room);
  
//   let gender = 'mixed';
//   if (room.room_gender_preference && Array.isArray(room.room_gender_preference)) {
//     const prefs = room.room_gender_preference.map(p => p.toLowerCase());
//     console.log(`Room ${room.id} preferences:`, prefs);
    
//     if (prefs.includes('male') && !prefs.includes('female')) {
//       gender = 'male';
//     } else if (prefs.includes('female') && !prefs.includes('male')) {
//       gender = 'female';
//     } else if (prefs.includes('male') && prefs.includes('female')) {
//       gender = 'mixed';
//     } else {
//       gender = 'mixed';
//     }
//   }

//   const totalBeds = room.total_bed || 0;
//   const occupiedBeds = room.occupied_beds || 0;
//   const availableBeds = totalBeds - occupiedBeds;
  
//   let status = 'available';
//   if (availableBeds === 0) {
//     status = 'occupied';
//   } else if (availableBeds < totalBeds) {
//     status = 'partially-available';
//   }

//   let maleOccupancy = 0;
//   let femaleOccupancy = 0;
  
//   if (room.bed_assignments && Array.isArray(room.bed_assignments)) {
//     room.bed_assignments.forEach(bed => {
//       if (bed.tenant_gender === 'Male' || bed.tenant_gender === 'male') maleOccupancy++;
//       if (bed.tenant_gender === 'Female' || bed.tenant_gender === 'female') femaleOccupancy++;
//     });
//   }

//   const sharingType = parseInt(room.sharing_type) || 2;
//   const price = room.rent_per_bed || 5000;
//   const ac = room.has_ac === true || room.has_ac === 'true';
  
//   console.log(`✅ Transformed room ${room.id}:`, {
//     sharingType,
//     price,
//     gender,
//     available: availableBeds,
//     totalBeds,
//     occupiedBeds,
//     status,
//     ac
//   });

//   return {
//     id: room.id.toString(),
//     name: room.room_number || `Room ${room.id}`,
//     sharingType: sharingType,
//     price: price,
//     floor: room.floor || 1,
//     gender: gender,
//     ac: ac,
//     wifi: true,
//     available: availableBeds,
//     totalBeds: totalBeds,
//     occupiedBeds: occupiedBeds,
//     occupancy: {
//       male: maleOccupancy,
//       female: femaleOccupancy
//     },
//     status: status,
//     amenities: room.amenities || [],
//     description: room.description || '',
//     roomType: room.room_type || 'Standard',
//     hasAttachedBathroom: room.has_attached_bathroom || false,
//     hasBalcony: room.has_balcony || false,
//     allowCouples: room.allow_couples || false,
//     isActive: room.is_active || true,
//     bedAssignments: room.bed_assignments || []
//   };
// };

// export default function PropertyPage() {
//   const params = useParams();
//   const id = params.slug as string;

//   const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [showAllRooms, setShowAllRooms] = useState(false);
//   const [copied, setCopied] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [propertyData, setPropertyData] = useState<any>(null);
//   const [propertyLoading, setPropertyLoading] = useState(true);
//   const [propertyError, setPropertyError] = useState<string | null>(null);
//   const [offers, setOffers] = useState<Offer[]>([]);
//   const [offersLoading, setOffersLoading] = useState(false);
//   const [offersError, setOffersError] = useState<string | null>(null);
//   const [roomsLoading, setRoomsLoading] = useState(false);
//   const [roomsError, setRoomsError] = useState<string | null>(null);
//   const [apiRooms, setApiRooms] = useState<any[]>([]);
//   const [bookingType, setBookingType] = useState('long');
//   const [showFilters, setShowFilters] = useState(false);
//   const [selectedFloor, setSelectedFloor] = useState('all');
//   const [selectedGender, setSelectedGender] = useState('all');
//   const [selectedSharing, setSelectedSharing] = useState('all');
//   const [priceRange, setPriceRange] = useState('all');
//   const [selectedAmenities, setSelectedAmenities] = useState({ ac: false, wifi: false });
//   const [availabilityFilter, setAvailabilityFilter] = useState('all');
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [bookingStep, setBookingStep] = useState(1);
//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     phone: '',
//     gender: '',
//     moveInDate: '',
//     checkInDate: '',
//     checkOutDate: '',
//     guests: "1",
//     sharingType: 0,
//     roomId: '',
//     planId: '',
//     couponCode: '',
//     agreeToTerms: false
//   });
//   const [couponApplied, setCouponApplied] = useState(false);
//   const [couponError, setCouponError] = useState('');

//   const COUPON_CODES = {
//     'FIRST20': { discount: 20, type: 'percentage', description: '20% off first month' },
//     'SAVE500': { discount: 500, type: 'fixed', description: '₹500 off' }
//   };

//   // Fetch property data on component mount
//   useEffect(() => {
//     console.log("Fetching property data for ID:", id);
//     fetchPropertyData();
//   }, [id]);

//   // Auto-slide images when property data is loaded
//   useEffect(() => {
//     if (!propertyData?.images?.length) return;
    
//     const interval = setInterval(() => {
//       nextImage();
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [propertyData]);

//   useEffect(() => {
//     if (propertyData && propertyData.id && !offersLoading) {
//       console.log("🏠 Property data loaded, fetching offers...", propertyData.id);
//       fetchOffers();
//     }
//   }, [propertyData]);

//   // Fetch offers for this property
// const fetchOffers = async () => {
//   try {
//     setOffersLoading(true);
//     setOffersError(null);
    
//     console.log("🔄 Starting offers fetch...");
//     console.log("📊 Current propertyData:", propertyData);
    
//     if (!propertyData) {
//       console.log("⏳ No propertyData yet");
//       return;
//     }
    
//     // Try to get offers with property ID
//     const numericPropertyId = propertyData.id;
//     console.log("🔢 Using property ID for offers:", numericPropertyId);
    
//     // Try to fetch offers with the property ID directly
//     const propertyOffers = await offerApi.getAll(numericPropertyId);
//     console.log("✅ Offers for property:", propertyOffers);
    
//     setOffers(propertyOffers);
    
//   } catch (error) {
//     console.error("❌ Error in fetchOffers:", error);
//     setOffersError(error.message || "Failed to load offers");
//   } finally {
//     setOffersLoading(false);
//   }
// };

//   // Fetch property and rooms data
// const fetchPropertyData = async () => {
//   try {
//     setPropertyLoading(true);
//     setPropertyError(null);
//     console.log("🔄 Fetching property with slug:", id);
    
//     // First, try to fetch by slug (if your backend supports it)
//     // If not, we need to get all properties and find the one with matching slug
    
//     // OPTION 1: If backend has slug endpoint (recommended)
//     try {
//       // First try to fetch by slug directly
//       const slugResponse = await request<ApiResult<Property>>(`/api/properties/slug/${id}`, {
//         method: "GET",
//       });
      
//       if (slugResponse.success && slugResponse.data) {
//         console.log("✅ Found property by slug:", slugResponse.data);
//         const transformedData = transformPropertyData(slugResponse.data);
//         setPropertyData(transformedData);
//         await fetchRooms(slugResponse.data.id);
//         return;
//       }
//     } catch (slugError) {
//       console.log("⚠️ Slug endpoint not available, trying ID...");
//     }
    
//     // OPTION 2: Try to parse as numeric ID
//     const numericId = parseInt(id);
//     if (!isNaN(numericId)) {
//       console.log("🔢 Trying numeric ID:", numericId);
//       const numericResponse = await getProperty(numericId);
      
//       if (numericResponse.success && numericResponse.data) {
//         const transformedData = transformPropertyData(numericResponse.data);
//         setPropertyData(transformedData);
//         await fetchRooms(numericResponse.data.id);
//         return;
//       }
//     }
    
//     // OPTION 3: Fetch all properties and find matching slug
//     console.log("🔄 Fetching all properties to find by slug...");
//     const allPropertiesResponse = await listProperties();
    
//     if (allPropertiesResponse.success && allPropertiesResponse.data) {
//       // Find property with matching slug
//       const foundProperty = allPropertiesResponse.data.find(
//         (property: Property) => property.slug === id
//       );
      
//       if (foundProperty) {
//         console.log("✅ Found property in list:", foundProperty);
//         const transformedData = transformPropertyData(foundProperty);
//         setPropertyData(transformedData);
//         await fetchRooms(foundProperty.id);
//         return;
//       }
      
//       // If not found by slug, try to find by name (case-insensitive)
//       const foundByName = allPropertiesResponse.data.find(
//         (property: Property) => 
//           property.name.toLowerCase().replace(/\s+/g, '-') === id.toLowerCase()
//       );
      
//       if (foundByName) {
//         console.log("✅ Found property by name:", foundByName);
//         const transformedData = transformPropertyData(foundByName);
//         setPropertyData(transformedData);
//         await fetchRooms(foundByName.id);
//         return;
//       }
//     }
    
//     throw new Error(`Property "${id}" not found`);
    
//   } catch (error) {
//     console.error("❌ Error fetching property:", error);
//     setPropertyError(`Failed to load property: ${id}. Please try again.`);
    
//     // Fallback to generic demo data (not hardcoded to property 2)
//     const demoData = transformPropertyData({
//       id: id, // Use the slug as ID
//       name: id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
//       area: "Location information",
//       address: "Address not available",
//       description: "Property details loading...",
//       photo_urls: [
//         "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
//         "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"
//       ],
//       total_beds: 0,
//       occupied_beds: 0,
//       starting_price: 0,
//       security_deposit: 0,
//       rating: null,
//       property_manager_name: "Manager not available",
//       property_manager_phone: "",
//       services: []
//     });
//     setPropertyData(demoData);
//   } finally {
//     setPropertyLoading(false);
//   }
// };

//   // Fetch rooms for the property
//   const fetchRooms = async (propertyId: number) => {
//     try {
//       setRoomsLoading(true);
//       setRoomsError(null);
//       console.log("🔄 Fetching rooms for property ID:", propertyId);
      
//       const response = await listRoomsByProperty(propertyId);
//       console.log("✅ Rooms API response:", response);
      
//       if (response.success && response.data && Array.isArray(response.data)) {
//         const transformedRooms = response.data.map(room => transformRoomData(room));
//         console.log(`✅ Loaded ${transformedRooms.length} transformed rooms:`, transformedRooms);
        
//         setApiRooms(transformedRooms);
//         setPropertyData((prev: any) => ({
//           ...prev,
//           rooms: transformedRooms
//         }));
        
//         console.log(`✅ Final property data rooms:`, transformedRooms.length);
//       } else {
//         console.log("⚠️ No rooms found or API error:", response.message);
//         setRoomsError(response.message || "No rooms available");
        
//         setApiRooms([]);
//         setPropertyData((prev: any) => ({
//           ...prev,
//           rooms: []
//         }));
//       }
//     } catch (error) {
//       console.error("❌ Error fetching rooms:", error);
//       setRoomsError("Failed to load room data. Please try again.");
      
//       setApiRooms([]);
//       setPropertyData((prev: any) => ({
//         ...prev,
//         rooms: []
//       }));
//     } finally {
//       setRoomsLoading(false);
//     }
//   };

//   const handleShare = () => {
//     navigator.clipboard.writeText(window.location.href);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const nextImage = () => {
//     if (!propertyData?.images?.length) return;
//     setCurrentImageIndex((prev) => (prev + 1) % propertyData.images.length);
//   };

//   const prevImage = () => {
//     if (!propertyData?.images?.length) return;
//     setCurrentImageIndex((prev) => (prev - 1 + propertyData.images.length) % propertyData.images.length);
//   };

//   // Filter logic for individual rooms
//   const filteredRooms = useMemo(() => {
//     if (!propertyData?.rooms) return [];
    
//     return propertyData.rooms.filter((room: any) => {
//       if (selectedFloor !== 'all' && room.floor !== Number(selectedFloor)) return false;
//       if (selectedGender !== 'all' && room.gender !== selectedGender) return false;
//       if (selectedSharing !== 'all' && room.sharingType !== Number(selectedSharing)) return false;
//       if (priceRange === 'low' && room.price > 5000) return false;
//       if (priceRange === 'mid' && (room.price <= 5000 || room.price > 7000)) return false;
//       if (priceRange === 'high' && room.price <= 7000) return false;
//       if (selectedAmenities.ac && !room.ac) return false;
//       if (selectedAmenities.wifi && !room.wifi) return false;
//       if (availabilityFilter === 'available' && room.status === 'occupied') return false;
//       if (availabilityFilter === 'occupied' && room.status !== 'occupied') return false;
//       if (availabilityFilter === 'partially' && room.status !== 'partially-available') return false;
//       return true;
//     });
//   }, [propertyData, selectedFloor, selectedGender, selectedSharing, priceRange, selectedAmenities, availabilityFilter]);

//   // roomTypeSummary calculation
//   const roomTypeSummary = useMemo(() => {
//     if (!propertyData?.rooms || propertyData.rooms.length === 0) {
//       console.log("📭 No rooms available in propertyData");
//       return [];
//     }
    
//     console.log("🔍 Processing rooms for summary:", propertyData.rooms);
    
//     const summaries = propertyData.rooms.map((room: any) => {
//       const sharingType = parseInt(room.sharingType?.toString()) || 2;
//       const availableCount = parseInt(room.available) || 0;
      
//       console.log(`📈 Processing room ${room.id}: sharing=${sharingType}, gender=${room.gender}, available=${availableCount}, price=${room.price}`);
      
//       const gender = (room.gender || '').toLowerCase();
//       let boysRooms = 0;
//       let girlsRooms = 0;
//       let mixedRooms = 0;
      
//       if (gender === 'male' || gender === 'm') {
//         boysRooms = 1;
//       } else if (gender === 'female' || gender === 'f') {
//         girlsRooms = 1;
//       } else {
//         mixedRooms = 1;
//       }
      
//       const availableNow = (room.status === 'available' || room.status === 'partially-available') 
//         ? availableCount 
//         : 0;
      
//       const price = parseInt(room.price) || 
//         (sharingType === 1 ? 7000 : 
//          sharingType === 2 ? 5000 : 
//          sharingType === 3 ? 4000 : 3500);
      
//       const hasAC = room.ac === true || room.ac === 'true';
//       const hasWiFi = room.wifi === true || room.wifi === 'true';
      
//       const summary = {
//         id: room.id,
//         sharingType: sharingType,
//         price: price,
//         totalAvailable: availableCount,
//         availableNow: availableNow,
//         totalRooms: 1,
//         hasAC: hasAC,
//         hasWiFi: hasWiFi,
//         boysRooms: boysRooms,
//         girlsRooms: girlsRooms,
//         mixedRooms: mixedRooms,
//         roomNumber: room.roomNumber || room.name || `Room ${room.id}`,
//         roomData: room
//       };
      
//       console.log(`✅ Summary for room ${room.id}:`, summary);
//       return summary;
//     });
    
//     summaries.sort((a, b) => {
//       const sharingDiff = a.sharingType - b.sharingType;
//       if (sharingDiff !== 0) return sharingDiff;
      
//       const availableDiff = b.availableNow - a.availableNow;
//       if (availableDiff !== 0) return availableDiff;
      
//       return a.price - b.price;
//     });
    
//     console.log("🎯 Final summaries (individual rooms):", summaries);
//     return summaries;
//   }, [propertyData]);

//   const groupedRooms = useMemo(() => {
//     const groups: any = {};
//     filteredRooms.forEach((room: any) => {
//       if (!groups[room.sharingType]) groups[room.sharingType] = [];
//       groups[room.sharingType].push(room);
//     });
//     return groups;
//   }, [filteredRooms]);

//   const filteredAmenities = useMemo(() => {
//     if (!propertyData?.amenities) return [];
//     if (selectedCategory === 'all') return propertyData.amenities;
//     return propertyData.amenities.filter((amenity: any) => amenity.category === selectedCategory);
//   }, [propertyData, selectedCategory]);

//   // Get all unique categories from amenities
//   const allCategories = useMemo(() => {
//     if (!propertyData?.amenities) return ['all'];
    
//     const categories = ['all'];
//     propertyData.amenities.forEach((amenity: any) => {
//       if (amenity.category && !categories.includes(amenity.category)) {
//         categories.push(amenity.category);
//       }
//     });
//     return categories;
//   }, [propertyData]);

//   const clearFilters = () => {
//     setSelectedFloor('all');
//     setSelectedGender('all');
//     setSelectedSharing('all');
//     setPriceRange('all');
//     setSelectedAmenities({ ac: false, wifi: false });
//     setAvailabilityFilter('all');
//     setSelectedCategory('all');
//   };

//   const hasActiveFilters = selectedFloor !== 'all' || selectedGender !== 'all' || selectedSharing !== 'all' ||
//     priceRange !== 'all' || selectedAmenities.ac || selectedAmenities.wifi || availabilityFilter !== 'all';

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
//   };

//   const handleBookingSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (bookingStep < 4) {
//       setBookingStep(bookingStep + 1);
//       return;
//     }

//     if (!formData.agreeToTerms) {
//       alert('Please agree to terms and conditions');
//       return;
//     }

//     setLoading(true);

//     try {
//       // Long stay booking
//       if (bookingType === 'long') {
//         const payload = {
//           property_id: propertyData?.id || "property_id_here",
//           name: formData.fullName,
//           email: formData.email,
//           phone: formData.phone,
//           preferred_move_in: formData.moveInDate,
//           room_type: formData.sharingType.toString(),
//           status: "pending",
//         };

//         await new Promise(resolve => setTimeout(resolve, 1000));
//         alert(`Booking request submitted for ${formData.fullName}. We'll contact you shortly!`);
//       }
//       // Short stay booking
//       else {
//         const checkIn = new Date(formData.checkInDate);
//         const checkOut = new Date(formData.checkOutDate);

//         if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
//           alert("Please select valid check-in and check-out dates.");
//           setLoading(false);
//           return;
//         }

//         const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
//         const dailyRate = propertyData?.dailyRate || 500;
//         const total = days * dailyRate;
//         const bookingNumber = "SSB" + Date.now();

//         const payload = {
//           booking_number: bookingNumber,
//           property_id: propertyData?.id || "property_id_here",
//           guest_name: formData.fullName,
//           guest_email: formData.email,
//           guest_phone: formData.phone,
//           check_in_date: formData.checkInDate,
//           check_out_date: formData.checkOutDate,
//           number_of_days: days,
//           daily_rate: dailyRate,
//           total_amount: total,
//           status: "pending",
//           payment_status: "unpaid",
//         };

//         await new Promise(resolve => setTimeout(resolve, 1000));
//         alert(`Short stay booking confirmed! Booking #${bookingNumber}\nTotal: ₹${total.toLocaleString()} for ${days} days\n\nWe'll contact you shortly to confirm.`);
//       }

//       // Reset form and close modal
//       setIsBookingModalOpen(false);
//       setBookingStep(1);
//       setFormData({
//         fullName: '', email: '', phone: '', gender: '', moveInDate: '',
//         checkInDate: '', checkOutDate: '', guests: "1",
//         sharingType: 0, roomId: '', planId: '', couponCode: '', agreeToTerms: false
//       });
//       setCouponApplied(false);
//       setCouponError('');

//     } catch (err) {
//       console.error("Error submitting booking:", err);
//       alert("Error submitting booking. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateTotal = () => {
//     if (bookingType === 'short') {
//       const checkIn = new Date(formData.checkInDate);
//       const checkOut = new Date(formData.checkOutDate);
//       if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return 0;

//       const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
//       return days * (propertyData?.dailyRate || 500);
//     }

//     const selectedPlan = propertyData?.pricingPlans?.find((p: any) => p.id === formData.planId);
//     if (!selectedPlan) return 0;
//     let total = selectedPlan.price;
//     if (couponApplied && formData.couponCode) {
//       const coupon = (COUPON_CODES as any)[formData.couponCode];
//       if (coupon) {
//         total -= coupon.type === 'percentage' ? (total * coupon.discount) / 100 : coupon.discount;
//       }
//     }
//     return total;
//   };

//   const applyCoupon = () => {
//     const coupon = (COUPON_CODES as any)[formData.couponCode];
//     if (coupon) {
//       setCouponApplied(true);
//       setCouponError('');
//     } else {
//       setCouponError('Invalid coupon code');
//       setCouponApplied(false);
//     }
//   };

//   // Show loading state
//   if (propertyLoading || offersLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
//         <div className="text-center">
//           <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-sm md:text-lg font-semibold text-gray-700">Loading property details...</p>
//         </div>
//       </div>
//     );
//   }

//   // Show error state
//   if (propertyError && !propertyData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
//         <div className="text-center max-w-md p-6 bg-white rounded-2xl shadow-xl">
//           <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-4" />
//           <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Unable to Load Property</h2>
//           <p className="text-gray-600 mb-4">{propertyError}</p>
//           <button
//             onClick={fetchPropertyData}
//             className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Show fallback if no property data
//   if (!propertyData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
//         <div className="text-center">
//           <Home className="w-16 h-16 md:w-20 md:h-20 text-gray-400 mx-auto mb-4" />
//           <p className="text-sm md:text-lg font-semibold text-gray-700">No property data available</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
//       {/* Floating Action Buttons - Responsive */}
//       <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex flex-col gap-2 md:gap-3">
//         <button
//           onClick={handleShare}
//           className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-3 md:p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-0.5 md:hover:-translate-y-1"
//           title="Share Property"
//         >
//           <Share2 className="w-5 h-5" />
//         </button>
//         <button
//           onClick={() => setIsBookingModalOpen(true)}
//           className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-3 md:p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-0.5 md:hover:-translate-y-1 animate-pulse"
//           title="Book Now"
//         >
//           <CalendarDays className="w-5 h-5" />
//         </button>
//       </div>

//       {/* Main Container */}
//       <div className="max-w-[1800px] mx-auto px-3 py-2 md:px-4 md:py-3">
//         {/* Sticky Back Button */}
//         <div className="sticky top-20 md:top-[60px] z-50 md:bg-white backdrop-blur-sm rounded-lg md:rounded-none px-2 py-1 mb-2">
//           <a
//             href="/properties"
//             className="inline-flex items-center gap-1 md:gap-2 text-black font-semibold text-xs md:text-sm rounded transition-all group"
//           >
//             <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform" />
//             <span>Back to Properties</span>
//           </a>
//         </div>

//         {/* Header - Responsive */}
//         <div className="mb-3 md:mb-2">
//           <div className="bg-white rounded-xl p-3 md:p-4 shadow-lg md:shadow-xl relative">
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
//               {/* Left Section - Property Info */}
//               <div className="flex-1 min-w-0">
//                 <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-1">
//                   <h1 className="text-lg md:text-2xl font-black gradient-text truncate">
//                     {propertyData.name}
//                   </h1>
//                   {propertyData.isFeatured && (
//                     <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap">
//                       <Star className="w-2 h-2 md:w-3 md:h-3 inline mr-0.5" />
//                       Featured
//                     </span>
//                   )}
//                 </div>

//                 <div className="flex items-center gap-1 md:gap-2 text-gray-600 mb-1">
//                   <MapPin className="w-3 h-3 md:w-4 md:h-4 text-blue-600 flex-shrink-0" />
//                   <span className="font-semibold text-xs md:text-sm truncate">
//                     {propertyData.location}
//                   </span>
//                 </div>

//                 <p className="text-[10px] md:text-xs text-gray-500 line-clamp-1 md:line-clamp-none">
//                   {propertyData.address}
//                 </p>
//               </div>

//               {/* Stats - Responsive Grid */}
//               <div className="grid grid-cols-3 md:flex md:items-center gap-1 md:gap-3 text-xs">
//                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg px-2 py-1.5 md:px-3 md:py-2 border border-green-200">
//                   <p className="font-bold text-green-700 text-[10px] md:text-xs">Available Beds</p>
//                   <div className="flex items-baseline gap-0.5 md:gap-1">
//                     <Bed className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
//                     <span className="font-black text-green-700 text-sm md:text-base">
//                       {propertyData.totalBeds - propertyData.occupiedBeds}
//                     </span>
//                     <span className="text-gray-600 font-bold text-[10px] md:text-sm">
//                       /{propertyData.totalBeds}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg px-2 py-1.5 md:px-3 md:py-2 border border-blue-200">
//                   <p className="font-bold text-blue-700 text-[10px] md:text-xs">Starting From</p>
//                   <div className="flex items-baseline gap-0.5 md:gap-1">
//                     <IndianRupee className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
//                     <span className="font-black text-blue-600 text-sm md:text-base">
//                       {propertyData.startingPrice.toLocaleString()}
//                     </span>
//                     <span className="text-gray-600 font-bold text-[10px] md:text-sm">/mo</span>
//                   </div>
//                 </div>

//                 <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg px-2 py-1.5 md:px-3 md:py-2 border border-amber-200">
//                   <p className="font-bold text-amber-700 text-[10px] md:text-xs">Rating</p>
//                   <div className="flex items-baseline gap-0.5 md:gap-1">
//                     <Star className="w-3 h-3 md:w-4 md:h-4 text-amber-600 fill-amber-600" />
//                     <span className="font-black text-amber-700 text-sm md:text-base">
//                       {propertyData.averageRating}
//                     </span>
//                     <span className="text-gray-600 font-bold text-[10px] md:text-sm">/5.0</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Layout - Responsive Grid */}
//         <div className="lg:grid lg:grid-cols-[1fr,400px] lg:gap-6 space-y-4 lg:space-y-0">
//           {/* Main Content */}
//           <div className="space-y-4 lg:space-y-6">
//             {/* Image Gallery */}
//             <div className="relative group">
//               <div className="relative w-full h-[250px] md:h-[400px] lg:h-[500px] xl:h-[600px] rounded-xl md:rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl">
//                 <img
//                   src={propertyData.images[currentImageIndex]}
//                   alt="Property"
//                   className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

//                 {/* Image Stats */}
//                 <div className="absolute top-3 md:top-6 left-3 md:left-6 flex gap-1.5 md:gap-3">
//                   <div className="glass-dark px-2 py-1.5 md:px-4 md:py-3 rounded-lg md:rounded-xl backdrop-blur-md flex items-center gap-1 md:gap-2 shadow-lg">
//                     <Eye className="w-3 h-3 md:w-5 md:h-5 text-white" />
//                     <span className="font-black text-xs md:text-base text-white">{propertyData.activity.totalViews}</span>
//                   </div>
//                   <div className="glass-dark px-2 py-1.5 md:px-4 md:py-3 rounded-lg md:rounded-xl backdrop-blur-md flex items-center gap-1 md:gap-2 shadow-lg">
//                     <Heart className="w-3 h-3 md:w-5 md:h-5 text-rose-400" />
//                     <span className="font-black text-xs md:text-base text-white">{propertyData.activity.shortlistedBy}</span>
//                   </div>
//                 </div>

//                 {/* Navigation Buttons */}
//                 <button onClick={prevImage} className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 glass-dark p-2 md:p-4 rounded-lg md:rounded-2xl text-white transition-all hover:scale-105 md:hover:scale-110">
//                   <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
//                 </button>
//                 <button onClick={nextImage} className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 glass-dark p-2 md:p-4 rounded-lg md:rounded-2xl text-white transition-all hover:scale-105 md:hover:scale-110">
//                   <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
//                 </button>

//                 {/* Image Counter */}
//                 <div className="absolute bottom-3 md:bottom-6 left-3 md:left-6 glass-dark px-2 py-1.5 md:px-5 md:py-3 rounded-lg md:rounded-2xl text-white font-bold flex items-center gap-1 md:gap-2 text-xs md:text-base">
//                   <ImageIcon className="w-3 h-3 md:w-5 md:h-5" />
//                   {currentImageIndex + 1} / {propertyData.images.length}
//                 </div>
//               </div>

//               {/* Thumbnail Strip */}
//               <div className="flex gap-1.5 md:gap-3 mt-2 md:mt-4 overflow-x-auto pb-1 md:pb-2">
//                 {propertyData.images.map((img: string, index: number) => (
//                   <button
//                     key={index}
//                     onClick={() => setCurrentImageIndex(index)}
//                     className={`flex-shrink-0 w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-lg md:rounded-xl overflow-hidden border transition-all ${currentImageIndex === index
//                         ? 'border-blue-600 scale-105 shadow-md md:shadow-lg'
//                         : 'border-gray-200 hover:border-gray-300'
//                       }`}
//                   >
//                     <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Description Card */}
//             <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-2xl">
//               <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-3 md:px-6 py-2 md:py-4 flex items-center justify-between">
//                 <div className="flex items-center gap-2 md:gap-3">
//                   <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center">
//                     <FileText className="w-4 h-4 md:w-5 md:h-5 text-white" />
//                   </div>
//                   <h2 className="text-sm md:text-xl font-black text-white">About This Property</h2>
//                 </div>
//               </div>
//               <div className="p-3 md:p-6">
//                 <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg md:rounded-xl p-3 md:p-6 mb-3 md:mb-6 border border-blue-100 md:border-2">
//                   <p className="text-gray-800 leading-relaxed font-medium text-xs md:text-base">
//                     {propertyData.description}
//                   </p>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
//                   {propertyData.highlights.map((highlight: string, i: number) => (
//                     <div key={i} className="flex items-center gap-2 md:gap-3 bg-white p-2 md:p-4 rounded-lg md:rounded-xl border border-gray-100 md:border-2 hover:border-blue-200 transition-all">
//                       <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
//                       <span className="text-xs md:text-sm font-bold text-gray-800">{highlight}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Available Rooms */}
//             <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg md:shadow-2xl">
//               <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0 mb-3 md:mb-6">
//                 <div>
//                   <h2 className="text-base md:text-2xl font-black gradient-text flex items-center">
//                     <Home className="w-4 h-4 md:w-6 md:h-6 mr-1 md:mr-2" />Available Rooms
//                   </h2>
//                   {roomsError && (
//                     <p className="text-xs md:text-sm text-amber-600 font-semibold mt-0.5 md:mt-1">
//                       ⚠️ {roomsError}
//                     </p>
//                   )}
//                   {!roomsLoading && propertyData?.rooms?.length === 0 && (
//                     <p className="text-xs md:text-sm text-gray-500 font-medium mt-0.5 md:mt-1">
//                       No rooms available at the moment
//                     </p>
//                   )}
//                   <div className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">
//                     Showing {Math.min(roomTypeSummary.length, 3)} of {roomTypeSummary.length} room types
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-1.5 md:gap-2">
//                   <button
//                     onClick={() => setShowFilters(!showFilters)}
//                     className="flex items-center gap-1 md:gap-2 px-2 py-1.5 md:px-4 md:py-2 bg-white border border-gray-200 md:border-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm hover:border-blue-500 transition-all"
//                   >
//                     <Filter className="w-3 h-3 md:w-4 md:h-4" />
//                     Filters
//                   </button>
//                   <button
//                     onClick={() => setShowAllRooms(true)}
//                     className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg md:rounded-xl font-bold hover:shadow-lg md:hover:shadow-xl transition-all text-xs md:text-sm"
//                   >
//                     View All Rooms
//                   </button>
//                 </div>
//               </div>

//               {roomsLoading ? (
//                 <div className="text-center py-6 md:py-12">
//                   <div className="w-8 h-8 md:w-16 md:h-16 border-3 md:border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2 md:mb-4"></div>
//                   <p className="text-sm md:text-lg font-semibold text-gray-700">Loading rooms...</p>
//                 </div>
//               ) : (
//                 <>
//                   {/* Filters Panel */}
//                   {showFilters && (
//                     <div className="mb-3 md:mb-6 bg-white/50 rounded-lg md:rounded-xl p-2 md:p-4 border border-gray-100 md:border-2">
//                       <div className="flex items-center justify-between mb-2 md:mb-4">
//                         <h3 className="font-bold text-gray-900 text-xs md:text-base">Filter Rooms</h3>
//                         {hasActiveFilters && (
//                           <button
//                             onClick={clearFilters}
//                             className="text-[10px] md:text-xs text-blue-600 font-semibold hover:text-blue-700"
//                           >
//                             Clear All
//                           </button>
//                         )}
//                       </div>
//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-3">
//                         <div>
//                           <label className="block text-[10px] md:text-xs font-semibold text-gray-700 mb-0.5 md:mb-1">Floor</label>
//                           <select
//                             value={selectedFloor}
//                             onChange={(e) => setSelectedFloor(e.target.value)}
//                             className="w-full px-1.5 md:px-3 py-1 md:py-2 border border-gray-300 rounded md:rounded-lg text-xs md:text-sm"
//                           >
//                             <option value="all">All Floors</option>
//                             <option value="1">1st Floor</option>
//                             <option value="2">2nd Floor</option>
//                             <option value="3">3rd Floor</option>
//                           </select>
//                         </div>

//                         <div>
//                           <label className="block text-[10px] md:text-xs font-semibold text-gray-700 mb-0.5 md:mb-1">Gender</label>
//                           <select
//                             value={selectedGender}
//                             onChange={(e) => setSelectedGender(e.target.value)}
//                             className="w-full px-1.5 md:px-3 py-1 md:py-2 border border-gray-300 rounded md:rounded-lg text-xs md:text-sm"
//                           >
//                             <option value="all">All</option>
//                             <option value="male">Male</option>
//                             <option value="female">Female</option>
//                             <option value="mixed">Mixed</option>
//                           </select>
//                         </div>

//                         <div>
//                           <label className="block text-[10px] md:text-xs font-semibold text-gray-700 mb-0.5 md:mb-1">Sharing</label>
//                           <select
//                             value={selectedSharing}
//                             onChange={(e) => setSelectedSharing(e.target.value)}
//                             className="w-full px-1.5 md:px-3 py-1 md:py-2 border border-gray-300 rounded md:rounded-lg text-xs md:text-sm"
//                           >
//                             <option value="all">All Types</option>
//                             <option value="1">1 Sharing</option>
//                             <option value="2">2 Sharing</option>
//                             <option value="3">3 Sharing</option>
//                             <option value="4">4 Sharing</option>
//                           </select>
//                         </div>

//                         <div>
//                           <label className="block text-[10px] md:text-xs font-semibold text-gray-700 mb-0.5 md:mb-1">Price</label>
//                           <select
//                             value={priceRange}
//                             onChange={(e) => setPriceRange(e.target.value)}
//                             className="w-full px-1.5 md:px-3 py-1 md:py-2 border border-gray-300 rounded md:rounded-lg text-xs md:text-sm"
//                           >
//                             <option value="all">All Prices</option>
//                             <option value="low">Under ₹5000</option>
//                             <option value="mid">₹5000-₹7000</option>
//                             <option value="high">Above ₹7000</option>
//                           </select>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {roomTypeSummary.length === 0 ? (
//                     <div className="text-center py-6 md:py-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg md:rounded-2xl border border-blue-100 md:border-2">
//                       <Home className="w-10 h-10 md:w-16 md:h-16 text-blue-400 mx-auto mb-2 md:mb-4" />
//                       <h3 className="text-sm md:text-xl font-bold text-gray-700 mb-1 md:mb-2">No Rooms Available</h3>
//                       <p className="text-gray-600 mb-2 md:mb-4 text-xs md:text-base">
//                         There are currently no rooms available for this property.
//                       </p>
//                       <p className="text-[10px] md:text-sm text-gray-500">
//                         Please check back later or contact the property manager.
//                       </p>
//                     </div>
//                   ) : (
//                     <>
//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-6">
//                         {roomTypeSummary.slice(0, 3).map((summary: any) => (
//                           <div
//                             key={summary.id}
//                             className="bg-white rounded-lg md:rounded-xl p-3 md:p-5 border border-gray-200 md:border-2 hover:border-blue-300 hover:shadow-md md:hover:shadow-xl transition-all cursor-pointer group"
//                             onClick={() => setShowAllRooms(true)}
//                           >
//                             <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
//                               <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-105 md:group-hover:scale-110 transition-transform">
//                                 <Users className="w-4 h-4 md:w-6 md:h-6 text-white" />
//                               </div>
//                               <div>
//                                 <h3 className="font-black text-sm md:text-lg bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
//                                   {summary.sharingType} Sharing
//                                 </h3>
//                                 <p className="text-[10px] md:text-xs text-gray-500 font-semibold">
//                                   Room {summary.roomNumber}
//                                 </p>
//                               </div>
//                             </div>

//                             <div className="space-y-1.5 md:space-y-2 mb-2 md:mb-4">
//                               <div className="flex justify-between items-center">
//                                 <span className="text-xs md:text-sm text-gray-600 font-semibold">Available Beds</span>
//                                 <div className="flex items-center gap-1 md:gap-2">
//                                   <span className="text-sm md:text-base font-black text-blue-600">{summary.availableNow || 0}</span>
//                                   {summary.availableNow > 0 && (
//                                     <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 bg-green-100 text-green-700 rounded-full font-bold">
//                                       Available
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>

//                               <div className="flex items-center gap-1 md:gap-2">
//                                 {summary.hasAC && (
//                                   <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 bg-blue-100 text-blue-700 rounded-full font-semibold flex items-center gap-0.5 md:gap-1">
//                                     <Wind className="w-2.5 h-2.5 md:w-3 md:h-3" /> AC
//                                   </span>
//                                 )}
//                                 {summary.hasWiFi && (
//                                   <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 bg-purple-100 text-purple-700 rounded-full font-semibold flex items-center gap-0.5 md:gap-1">
//                                     <Wifi className="w-2.5 h-2.5 md:w-3 md:h-3" /> WiFi
//                                   </span>
//                                 )}
//                               </div>
//                             </div>

//                             <div className="pt-2 md:pt-4 border-t border-gray-200">
//                               <p className="text-lg md:text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
//                                 ₹{(summary.price || 5000).toLocaleString()}
//                                 <span className="text-xs md:text-sm text-gray-500 font-normal">/month</span>
//                               </p>
//                             </div>
//                           </div>
//                         ))}
//                       </div>

//                       {roomTypeSummary.length > 3 && (
//                         <div className="text-center pt-2 md:pt-4 border-t border-gray-200">
                         
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </>
//               )}
//             </div>

//             {/* Amenities */}
//             <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg md:shadow-2xl">
//               <h2 className="text-base md:text-2xl font-black gradient-text mb-3 md:mb-6">Amenities & Facilities</h2>

//               <div className="flex gap-1 md:gap-2 mb-3 md:mb-6 overflow-x-auto pb-1 md:pb-2">
//                 {allCategories.map(cat => {
//                   const isAll = cat === 'all';
//                   const isActive = selectedCategory === cat;
                  
//                   return (
//                     <button
//                       key={cat}
//                       onClick={() => setSelectedCategory(cat)}
//                       className={`px-2 md:px-4 py-1 md:py-2 rounded md:rounded-lg font-semibold text-[10px] md:text-sm whitespace-nowrap capitalize ${isActive
//                           ? isAll 
//                             ? 'bg-gradient-to-r from-blue-600 to-blue-600 text-white'
//                             : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
//                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                         }`}
//                     >
//                       {isAll ? 'All Amenities' : cat}
//                     </button>
//                   );
//                 })}
//               </div>

//               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
//                 {propertyData.amenities
//                   .filter((amenity: any) => 
//                     selectedCategory === 'all' || amenity.category === selectedCategory
//                   )
//                   .map((amenity: any, i: number) => {
//                     const IconComponent = (Icons as any)[amenity.icon];
//                     return (
//                       <div key={i} className="bg-white rounded-lg md:rounded-xl p-2 md:p-4 border border-gray-200 md:border-2 hover:border-violet-200 transition-all">
//                         <div className="flex flex-col items-center text-center gap-1.5 md:gap-3">
//                           <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg md:rounded-2xl flex items-center justify-center group-hover:scale-105 md:group-hover:scale-110 transition-transform">
//                             <IconComponent className="w-5 h-5 md:w-8 md:h-8 text-white" />
//                           </div>
//                           <div>
//                             <h3 className="font-bold text-gray-900 text-xs md:text-sm mb-0.5 md:mb-1">{amenity.title}</h3>
//                             <p className="text-[10px] md:text-xs text-gray-600 font-medium">{amenity.description}</p>
//                             <span className="text-[10px] md:text-xs text-blue-900 font-semibold mt-0.5 md:mt-1 inline-block">
//                               {amenity.category}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//               </div>

//               {propertyData.amenities.filter((a: any) => 
//                 selectedCategory === 'all' || a.category === selectedCategory
//               ).length === 0 && (
//                 <div className="text-center py-4 md:py-8">
//                   <div className="w-10 h-10 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
//                     <Home className="w-5 h-5 md:w-8 md:h-8 text-gray-400" />
//                   </div>
//                   <p className="text-gray-600 font-semibold text-xs md:text-base">
//                     No amenities found in the "{selectedCategory}" category
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Location & Nearby */}
//             <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg md:shadow-2xl">
//               <h2 className="text-base md:text-2xl font-black gradient-text flex items-center mb-2 md:mb-5">
//                 <MapPin className="w-4 h-4 md:w-6 md:h-6 mr-1 md:mr-2" />Location & Nearby
//               </h2>

//               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5 md:gap-3 mb-2 md:mb-5">
//                 {propertyData.nearbyPlaces.map((place: any, i: number) => {
//                   const Icon = (Icons as any)[place.type];
//                   return (
//                     <div key={i} className="bg-white/60 rounded-lg md:rounded-xl p-2 md:p-3 border border-gray-200 hover:border-blue-300 transition-all">
//                       <div className="flex items-center gap-1.5 md:gap-2">
//                         <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg md:rounded-xl flex items-center justify-center">
//                           <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
//                         </div>
//                         <div>
//                           <p className="text-xs md:text-sm font-bold text-gray-900">{place.name}</p>
//                           <p className="text-[10px] md:text-xs text-gray-600 font-semibold">{place.distance}</p>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               <div className="relative w-full h-[200px] md:h-[300px] lg:h-[350px] rounded-lg md:rounded-2xl overflow-hidden border border-gray-200 md:border-2 mb-2 md:mb-4">
//                 <iframe
//                   src={`https://www.google.com/maps?q=${propertyData.coordinates.lat},${propertyData.coordinates.lng}&z=15&output=embed`}
//                   className="w-full h-full border-0"
//                   loading="lazy"
//                   title="Property Location"
//                 />
//               </div>

//               <a
//                 href={`https://www.google.com/maps/dir/?api=1&destination=${propertyData.coordinates.lat},${propertyData.coordinates.lng}`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 md:py-3 rounded-lg md:rounded-xl transition-colors text-xs md:text-sm"
//               >
//                 Get Directions
//               </a>
//             </div>

//             {/* Reviews */}
//            <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg md:shadow-2xl">
//   <h2 className="text-base md:text-2xl font-black gradient-text mb-3 md:mb-6">
//     Guest Reviews
//   </h2>

//   <div className="flex flex-col md:grid md:grid-cols-[300px,1fr] gap-3 md:gap-6">
//     {/* LEFT SUMMARY CARD */}
//     <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg md:rounded-xl p-3 md:p-6 border border-blue-100 md:border-2">
//       <div className="text-center">
//         <div className="text-4xl md:text-6xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1 md:mb-2">
//           {propertyData.averageRating}
//         </div>

//         <div className="flex items-center justify-center gap-0.5 md:gap-1 mb-2 md:mb-3">
//           {[1, 2, 3, 4, 5].map((s) => (
//             <Star
//               key={s}
//               className={`w-4 h-4 md:w-6 md:h-6 ${
//                 s <= propertyData.averageRating
//                   ? "text-yellow-500 fill-yellow-500"
//                   : "text-gray-300"
//               }`}
//             />
//           ))}
//         </div>

//         <p className="text-xs md:text-sm font-bold text-gray-700 mb-0.5 md:mb-1">
//           Excellent
//         </p>

//         <p className="text-[10px] md:text-xs text-gray-500 mb-3 md:mb-4">
//           {propertyData.totalReviews} reviews
//         </p>

//         {/* ⭐ REVIEW DISTRIBUTION LINES (ADDED) */}
//         <div className="space-y-1">
//           {[5, 4, 3, 2, 1].map((star) => (
//             <div key={star} className="flex items-center gap-2">
//               <span className="text-[10px] md:text-xs font-bold text-gray-700 w-4">
//                 {star}
//               </span>

//               <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />

//               <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-blue-600 rounded-full"
//                   style={{ width: "70%" }} // UI only
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>

//     {/* RIGHT REVIEWS LIST */}
//     <div className="space-y-3 md:space-y-4">
//       {propertyData.reviews.map((review: any) => (
//         <div
//           key={review.id}
//           className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 border border-gray-100 md:border-2 hover:border-blue-100 transition-all"
//         >
//           <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
//             <img
//               src={review.userAvatar}
//               alt={review.userName}
//               className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl object-cover ring-1 md:ring-2 ring-gray-200"
//             />

//             <div className="flex-1">
//               <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-0 mb-1">
//                 <div>
//                   <p className="font-black text-gray-900 text-sm md:text-base">
//                     {review.userName}
//                   </p>

//                   <p className="text-[10px] md:text-xs text-gray-600 font-semibold">
//                     {review.roomType} • {review.stayDuration}
//                     {review.verified && (
//                       <span className="ml-1 md:ml-2 text-green-600 font-bold">
//                         <ShieldCheck className="w-2.5 h-2.5 md:w-3 md:h-3 inline mr-0.5 md:mr-1" />
//                         Verified
//                       </span>
//                     )}
//                   </p>
//                 </div>

//                 <div className="flex items-center gap-0.5 md:gap-1 bg-blue-50 px-2 py-1 md:px-3 md:py-1.5 rounded md:rounded-lg">
//                   <Star className="w-3 h-3 md:w-4 md:h-4 text-blue-600 fill-blue-600" />
//                   <span className="text-xs md:text-sm font-black text-blue-600">
//                     {review.rating}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <p className="text-xs md:text-sm text-gray-700 font-medium md:font-semibold leading-relaxed mb-2 md:mb-3">
//             {review.comment}
//           </p>

//           <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-gray-100">
//             <span className="text-[10px] md:text-xs text-gray-500 font-semibold">
//               {formatDate(review.date)}
//             </span>

//             <button className="flex items-center gap-1 text-[10px] md:text-xs text-gray-600 hover:text-blue-600 font-bold">
//               <ThumbsUp className="w-3 h-3 md:w-4 md:h-4" />
//               Helpful ({review.helpful})
//             </button>
//           </div>
//         </div>
//       ))}

//       <div className="flex justify-center pt-1 md:pt-2">
//         <button className="flex items-center gap-1 md:gap-2 px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg md:rounded-xl hover:shadow-lg transition-all hover:scale-105 text-xs md:text-sm">
//           Learn More
//           <ChevronRight className="w-3 h-3 md:w-4 md:h-4 transition-transform" />
//         </button>
//       </div>
//     </div>
//   </div>
// </div>

//           </div>

//           {/* Sidebar - Responsive */}
//           <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
//             {/* Property Manager Card */}
//             <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-2xl border border-blue-100 md:border-2">
//               <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
//                 <div className="flex items-center gap-1.5 md:gap-2">
//                   <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center">
//                     <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
//                   </div>
//                   <h3 className="text-xs md:text-sm font-black text-white">Property Manager</h3>
//                 </div>
//                 <div className="flex items-center gap-0.5 md:gap-1 bg-white/20 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
//                   <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-300 fill-yellow-300" />
//                   <span className="text-xs font-black text-white">{propertyData.manager.rating}</span>
//                 </div>
//               </div>
//               <div className="p-3 md:p-4">
//                 <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
//                   <img
//                     src={propertyData.manager.avatar}
//                     alt={propertyData.manager.name}
//                     className="w-14 h-14 md:w-20 md:h-20 rounded-lg md:rounded-xl object-cover ring-1 md:ring-2 ring-blue-200"
//                   />
//                   <div>
//                     <p className="font-black text-gray-900 text-sm md:text-lg">{propertyData.manager.name}</p>
//                     <p className="text-[10px] md:text-xs text-gray-600 font-semibold flex items-center gap-0.5 md:gap-1">
//                       <ShieldCheck className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-600" />
//                       Verified Manager
//                     </p>
//                   </div>
//                 </div>

//                 <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
//                   <a
//                     href={`tel:${propertyData.manager.phone}`}
//                     className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-700 hover:text-blue-600"
//                   >
//                     <Phone className="w-3 h-3 md:w-4 md:h-4" />
//                     {propertyData.manager.phone}
//                   </a>
//                   <a
//                     href={`mailto:${propertyData.manager.email}`}
//                     className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-700 hover:text-blue-600"
//                   >
//                     <Mail className="w-3 h-3 md:w-4 md:h-4" />
//                     {propertyData.manager.email}
//                   </a>
//                 </div>

//                 <div className="grid grid-cols-2 gap-1.5 md:gap-2">
//                   <a
//                     href={`tel:${propertyData.manager.phone}`}
//                     className="flex items-center justify-center gap-1 md:gap-1.5 px-2 py-1.5 md:px-3 md:py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg md:rounded-xl font-bold text-xs md:text-sm hover:shadow-lg transition-all"
//                   >
//                     <Phone className="w-3 h-3 md:w-4 md:h-4" />Call Now
//                   </a>
//                   <a
//                     href={`https://wa.me/${propertyData.manager.phone.replace(/[^0-9]/g, "")}?text=Hi, I'm interested in ${encodeURIComponent(propertyData.name)}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="flex items-center justify-center gap-1 md:gap-1.5 px-2 py-1.5 md:px-3 md:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg md:rounded-xl font-bold text-xs md:text-sm hover:shadow-lg transition-all"
//                   >
//                     <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />WhatsApp
//                   </a>
//                 </div>
//               </div>
//             </div>

//             {/* Offers */}
//             <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-lg md:shadow-2xl">
//               <div className="flex items-center justify-between mb-2 md:mb-3">
//                 <h2 className="text-sm md:text-base font-black gradient-text flex items-center">
//                   <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />Special Offers
//                 </h2>
//                 {offersLoading && (
//                   <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//                 )}
//               </div>
              
//               {offersError && (
//                 <p className="text-xs md:text-sm text-red-600 mb-2 md:mb-3 font-semibold">{offersError}</p>
//               )}
              
//               {offersLoading ? (
//                 <div className="text-center py-3 md:py-4">
//                   <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-1 md:mb-2"></div>
//                   <p className="text-[10px] md:text-xs text-gray-500">Loading offers...</p>
//                 </div>
//               ) : offers.length === 0 ? (
//                 <div className="text-center py-3 md:py-4">
//                   <p className="text-xs md:text-sm text-gray-500 font-medium">No active offers at the moment</p>
//                 </div>
//               ) : (
//                 <div className="space-y-2 md:space-y-3">
//                   {offers.slice(0, 3).map((offer) => (
//                     <div 
//                       key={offer.id} 
//                       className="relative bg-white/50 rounded-lg md:rounded-xl p-2 md:p-3 border border-gray-200 hover:border-amber-300 transition-all hover:shadow-sm"
//                     >
//                       {(offer.discount_value || offer.discount_percent) && (
//                         <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-bl-lg md:rounded-bl-xl font-bold text-[10px] md:text-xs">
//                           {offer.discount_percent ? `${offer.discount_percent}% OFF` : `₹${offer.discount_value} OFF`}
//                         </div>
//                       )}
                      
//                       <div className="flex items-start gap-2 md:gap-3 pr-8 md:pr-10">
//                         <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
//                           {offer.offer_type === 'discount' ? (
//                             <Percent className="w-3 h-3 md:w-4 md:h-4 text-white" />
//                           ) : offer.offer_type === 'cashback' ? (
//                             <Gift className="w-3 h-3 md:w-4 md:h-4 text-white" />
//                           ) : (
//                             <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-white" />
//                           )}
//                         </div>
//                         <div>
//                           <h3 className="font-bold text-gray-900 text-xs md:text-sm">{offer.title}</h3>
//                           <p className="text-[10px] md:text-xs text-gray-600 font-medium">{offer.description}</p>
//                           {offer.start_date && offer.end_date && (
//                             <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">
//                               Valid: {new Date(offer.start_date).toLocaleDateString()} - {new Date(offer.end_date).toLocaleDateString()}
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
                  
//                   {offers.length > 3 && (
//                     <div className="pt-1 md:pt-2 text-center">
//                       <button className="text-[10px] md:text-xs text-blue-600 font-semibold hover:text-blue-700">
//                         View all {offers.length} offers →
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Pricing Plans */}
//             <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg md:shadow-2xl">
//               <h2 className="text-base md:text-xl font-black gradient-text flex items-center mb-3 md:mb-5">
//                 <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />Pricing Plans
//               </h2>
//               <div className="space-y-2 md:space-y-4">
//                 {propertyData.pricingPlans.map((plan: any) => (
//                   <div
//                     key={plan.id}
//                     className={`relative bg-white rounded-lg md:rounded-xl p-3 md:p-5 border ${plan.recommended
//                         ? 'border-violet-400 shadow-md md:shadow-xl'
//                         : 'border-gray-200 md:border-white/20 hover:border-gray-300'
//                       }`}
//                   >
//                     {plan.recommended && (
//                       <div className="absolute -top-1.5 -right-1.5 md:-top-3 md:-right-3">
//                         <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 md:px-4 py-0.5 md:py-1.5 rounded-full text-[10px] md:text-xs font-black shadow md:shadow-lg">
//                           <Crown className="w-2.5 h-2.5 md:w-3 md:h-3 inline mr-0.5" />{window.innerWidth >= 768 ? 'Most Popular' : 'Popular'}
//                         </span>
//                       </div>
//                     )}
//                     <div className="flex items-start justify-between mb-2 md:mb-4">
//                       <div>
//                         <h3 className="text-sm md:text-lg font-black text-gray-900">{plan.name}</h3>
//                         <p className="text-[10px] md:text-sm text-gray-500 font-medium mt-0.5">All-inclusive</p>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-xl md:text-3xl font-black gradient-text">₹{plan.price.toLocaleString()}</p>
//                         <p className="text-[10px] md:text-xs text-gray-600 font-semibold">
//                           ~₹{plan.dailyRate}/day
//                         </p>
//                       </div>
//                     </div>
//                     <ul className="space-y-1 md:space-y-2 mb-2 md:mb-5">
//                       {plan.features.map((feature: string, i: number) => (
//                         <li key={i} className="flex items-start gap-1.5 md:gap-2">
//                           <Check className="w-3 h-3 md:w-4 md:h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
//                           <span className="text-xs md:text-sm text-gray-700 font-semibold">{feature}</span>
//                         </li>
//                       ))}
//                     </ul>
//                     <button
//                       onClick={() => {
//                         setIsBookingModalOpen(true);
//                         setBookingType('long');
//                       }}
//                       className={`w-full py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all hover:shadow ${plan.recommended
//                           ? 'bg-gradient-to-r from-blue-600 to-blue-600 text-white'
//                           : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white'
//                         }`}
//                     >
//                       Select Plan
//                     </button>
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-3 md:mt-6 pt-3 md:pt-6 border-t border-gray-200">
//                 <div className="text-center">
//                   <p className="text-xs md:text-sm text-gray-600 font-semibold mb-1.5 md:mb-2">Looking for short stay?</p>
//                   <button
//                     onClick={() => {
//                       setIsBookingModalOpen(true);
//                       setBookingType('short');
//                     }}
//                     className="w-full py-2 md:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg md:rounded-xl font-bold hover:shadow-lg transition-all text-xs md:text-sm"
//                   >
//                     Book Short Stay @ ₹{propertyData.dailyRate}/day
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Terms & Conditions */}
//             <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-lg md:shadow-2xl">
//               <h2 className="text-sm md:text-base font-black gradient-text mb-2 md:mb-3 flex items-center">
//                 <FileCheck className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />Terms & Conditions
//               </h2>
//               <div className="space-y-1.5 md:space-y-2 max-h-[200px] md:max-h-[300px] overflow-y-auto pr-1 md:pr-2">
//                 {propertyData.termsAndConditions.map((term: string, i: number) => (
//                   <div key={i} className="flex items-start gap-1.5 md:gap-2 p-2 md:p-3 bg-white/50 rounded md:rounded-lg border border-gray-200">
//                     <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-violet-600 flex-shrink-0 mt-0.5" />
//                     <p className="text-xs text-gray-700 font-medium leading-relaxed">{term}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Room View Modal - Responsive */}
//       {showAllRooms && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4">
//           <div className="bg-white rounded-xl md:rounded-2xl w-full max-w-4xl md:max-w-7xl max-h-[90vh] overflow-hidden shadow-xl md:shadow-2xl flex flex-col">
//             <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 px-3 md:px-6 py-2 md:py-4 flex items-center justify-between z-10">
//               <div className="flex items-center gap-2 md:gap-3">
//                 <div className="w-9 h-9 md:w-12 md:h-12 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center">
//                   <Home className="w-4 h-4 md:w-6 md:h-6 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-sm md:text-xl font-black text-white">All Available Rooms</h2>
//                   <p className="text-[10px] md:text-xs text-white/80 font-semibold">
//                     {filteredRooms.length} rooms found • {hasActiveFilters && 'Filters applied'}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-1.5 md:gap-3">
//                 {hasActiveFilters && (
//                   <button
//                     onClick={clearFilters}
//                     className="px-2 py-1 md:px-4 md:py-2 bg-white/20 text-white rounded md:rounded-lg text-xs md:text-sm font-semibold hover:bg-white/30 transition-all"
//                   >
//                     Clear Filters
//                   </button>
//                 )}
//                 <button
//                   onClick={() => setShowAllRooms(false)}
//                   className="p-1 md:p-2 hover:bg-white/20 rounded md:rounded-lg transition-all"
//                 >
//                   <X className="w-4 h-4 md:w-6 md:h-6 text-white" />
//                 </button>
//               </div>
//             </div>
//             <div className="p-3 md:p-6 overflow-y-auto flex-1">
//               {filteredRooms.length === 0 ? (
//                 <div className="text-center py-6 md:py-12">
//                   <div className="w-14 h-14 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
//                     <Search className="w-6 h-6 md:w-12 md:h-12 text-gray-400" />
//                   </div>
//                   <h3 className="text-sm md:text-xl font-bold text-gray-700 mb-1 md:mb-2">No rooms found</h3>
//                   <p className="text-gray-500 mb-3 md:mb-4 text-xs md:text-base">Try adjusting your filters to find more rooms</p>
//                   <button
//                     onClick={clearFilters}
//                     className="px-4 py-1.5 md:px-6 md:py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg md:rounded-xl font-bold text-xs md:text-sm"
//                   >
//                     Clear All Filters
//                   </button>
//                 </div>
//               ) : (
//                 <div className="space-y-3 md:space-y-6">
//                   {Object.entries(groupedRooms).map(([sharingType, sharingRooms]) => (
//                     <div key={sharingType} className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 border border-blue-100 md:border-2">
//                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-0 mb-3 md:mb-5 pb-2 md:pb-4 border-b border-gray-200">
//                         <div>
//                           <h3 className="font-black text-base md:text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
//                             {sharingType} Sharing
//                           </h3>
//                           <p className="text-xs md:text-sm text-gray-600 font-semibold">
//                             {(sharingRooms as any[]).length} rooms • {(sharingRooms as any[]).reduce((acc, r) => acc + r.available, 0)} beds available
//                           </p>
//                         </div>
//                         <p className="text-lg md:text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
//                           ₹{(sharingRooms as any[])[0].price.toLocaleString()}/mo
//                         </p>
//                       </div>
//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
//                         {(sharingRooms as any[]).map((room) => (
//                           <div
//                             key={room.id}
//                             className={`bg-white rounded-lg md:rounded-xl p-2.5 md:p-4 border transition-all hover:shadow ${room.status === 'available' || room.status === 'partially-available'
//                                 ? 'border-emerald-200 hover:border-emerald-400'
//                                 : 'border-orange-200 hover:border-orange-400'
//                               }`}
//                           >
//                             <div className="flex items-center justify-between mb-2 md:mb-3">
//                               <div>
//                                 <span className="text-xs md:text-sm font-black text-gray-900">{room.name}</span>
//                                 <p className="text-[10px] md:text-xs text-gray-500">Floor {room.floor}</p>
//                               </div>
//                               <span className={`text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1.5 rounded-full font-bold ${room.gender === 'male'
//                                   ? 'bg-blue-100 text-blue-700'
//                                   : room.gender === 'female'
//                                   ? 'bg-pink-100 text-pink-700'
//                                   : 'bg-purple-100 text-purple-700'
//                                 }`}>
//                                 {room.gender === 'male' ? '♂ Boys' : room.gender === 'female' ? '♀ Girls' : '👥 Mixed'}
//                               </span>
//                             </div>

//                             <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-4">
//                               <div className="flex items-center gap-0.5 md:gap-1 text-xs md:text-sm text-gray-600">
//                                 <Users className="w-3 h-3 md:w-4 md:h-4" />
//                                 <span className="font-semibold">
//                                   {room.occupancy.male + room.occupancy.female}/{sharingType}
//                                   {room.gender === 'mixed' && (
//                                     <span className="text-[10px] md:text-xs text-gray-500 ml-0.5 md:ml-1">
//                                       ({room.occupancy.male}♂ {room.occupancy.female}♀)
//                                     </span>
//                                   )}
//                                 </span>
//                               </div>
//                               <div className="flex items-center gap-1 ml-auto">
//                                 {room.ac && <Wind className="w-3 h-3 md:w-4 md:h-4 text-blue-600" title="Air Conditioned" />}
//                                 {room.wifi && <Wifi className="w-3 h-3 md:w-4 md:h-4 text-blue-600" title="WiFi Available" />}
//                                 {room.hasAttachedBathroom && <Bath className="w-3 h-3 md:w-4 md:h-4 text-blue-600" title="Attached Bathroom" />}
//                                 {room.hasBalcony && <Home className="w-3 h-3 md:w-4 md:h-4 text-blue-600" title="Balcony" />}
//                                 {room.available > 0 && (
//                                   <div className="text-[10px] md:text-xs font-bold text-emerald-600">
//                                     {room.available} bed{room.available > 1 ? 's' : ''}
//                                   </div>
//                                 )}
//                               </div>
//                             </div>

//                             <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-gray-200">
//                               <span className={`text-xs md:text-sm font-bold ${room.status === 'available' || room.status === 'partially-available' ? 'text-emerald-600' : 'text-orange-600'
//                                 }`}>
//                                 {room.status === 'available' ? 'Available Now' : 
//                                  room.status === 'partially-available' ? 'Partially Available' : 
//                                  'Fully Occupied'}
//                               </span>
//                               <button
//                                 onClick={() => {
//                                   setIsBookingModalOpen(true);
//                                   setShowAllRooms(false);
//                                   setFormData(prev => ({ ...prev, roomId: room.id }));
//                                 }}
//                                 className={`px-2.5 md:px-4 py-1 md:py-2 rounded md:rounded-lg text-xs md:text-sm font-bold ${room.status === 'available' || room.status === 'partially-available'
//                                     ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow md:hover:shadow-lg'
//                                     : 'bg-gradient-to-r from-gray-600 to-gray-800 text-white hover:shadow md:hover:shadow-lg'
//                                   }`}
//                                 disabled={room.status === 'occupied'}
//                               >
//                                 {room.status === 'available' || room.status === 'partially-available' ? 'Book Now' : 'Occupied'}
//                               </button>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Booking Modal - Responsive */}
//       {isBookingModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm">
//           <div className="bg-white rounded-xl md:rounded-2xl w-full max-w-lg md:max-w-3xl max-h-[90vh] overflow-hidden shadow-xl md:shadow-2xl">
//             <div className="sticky top-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white p-3 md:p-6 flex justify-between items-center z-10">
//               <div>
//                 <h2 className="text-sm md:text-2xl font-bold">
//                   {bookingType === 'long' ? 'Book Your Stay' : 'Book Short Stay'}
//                 </h2>
//                 <p className="text-violet-100 text-[10px] md:text-sm mt-0.5 md:mt-1">{propertyData.name}</p>
//               </div>
//               <button
//                 onClick={() => {
//                   setIsBookingModalOpen(false);
//                   setBookingStep(1);
//                   setBookingType('long');
//                 }}
//                 className="p-1 md:p-2 hover:bg-white/20 rounded-full transition-colors"
//               >
//                 <X className="w-4 h-4 md:w-6 md:h-6" />
//               </button>
//             </div>

//             <div className="px-3 md:px-6 pt-2 md:pt-4">
//               <div className="flex bg-gray-100 rounded-lg md:rounded-xl p-0.5 md:p-1 mb-2 md:mb-4">
//                 <button
//                   onClick={() => setBookingType('long')}
//                   className={`flex-1 py-1.5 md:py-2.5 rounded md:rounded-lg font-bold text-xs md:text-sm transition-all ${bookingType === 'long'
//                       ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
//                       : 'text-gray-600 hover:text-gray-900'
//                     }`}
//                 >
//                   Long Stay
//                 </button>
//                 <button
//                   onClick={() => setBookingType('short')}
//                   className={`flex-1 py-1.5 md:py-2.5 rounded md:rounded-lg font-bold text-xs md:text-sm transition-all ${bookingType === 'short'
//                       ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
//                       : 'text-gray-600 hover:text-gray-900'
//                     }`}
//                 >
//                   Short Stay
//                 </button>
//               </div>
//             </div>

//             <div className="overflow-y-auto max-h-[calc(90vh-100px)] md:max-h-[calc(90vh-180px)]">
//               <div className="p-3 md:p-6">
//                 {/* Progress Steps */}
//                 <div className="flex items-center justify-between mb-4 md:mb-8">
//                   {[{ num: 1, label: 'Info' }, { num: 2, label: 'Select' }, { num: 3, label: 'Room' }, { num: 4, label: 'Payment' }].map((s, idx) => (
//                     <div key={s.num} className="flex items-center flex-1">
//                       <div className="flex flex-col items-center flex-1">
//                         <div className={`w-7 h-7 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-xs md:text-base transition-all ${bookingStep >= s.num
//                             ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow md:shadow-lg'
//                             : 'bg-gray-200 text-gray-500'
//                           }`}>
//                           {bookingStep > s.num ? <Check className="w-3 h-3 md:w-6 md:h-6" /> : s.num}
//                         </div>
//                         <span className={`text-[10px] md:text-sm mt-0.5 md:mt-2 font-semibold ${bookingStep >= s.num ? 'text-violet-600' : 'text-gray-500'
//                           }`}>{s.label}</span>
//                       </div>
//                       {idx < 3 && (
//                         <div className={`flex-1 h-0.5 md:h-1 mx-0.5 md:mx-2 rounded transition-all ${bookingStep > s.num
//                             ? 'bg-gradient-to-r from-violet-600 to-purple-600'
//                             : 'bg-gray-200'
//                           }`} />
//                       )}
//                     </div>
//                   ))}
//                 </div>

//                 <form onSubmit={handleBookingSubmit} className="space-y-3 md:space-y-6">
//                   {/* Step 1: Personal Information */}
//                   {bookingStep === 1 && (
//                     <div className="space-y-3 md:space-y-5">
//                       <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-2 md:mb-4">Personal Information</h3>
//                       <div className="space-y-2 md:space-y-4">
//                         <div className="grid md:grid-cols-2 gap-2 md:gap-4">
//                           <div>
//                             <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2 flex items-center">
//                               <User className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-violet-600" />Full Name *
//                             </label>
//                             <input
//                               type="text"
//                               required
//                               value={formData.fullName}
//                               onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
//                               className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 md:border-2 rounded-lg md:rounded-xl focus:ring-1 md:focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all text-sm"
//                               placeholder="Enter your full name"
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2 flex items-center">
//                               <Phone className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-violet-600" />Phone *
//                             </label>
//                             <input
//                               type="tel"
//                               required
//                               value={formData.phone}
//                               onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                               className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 md:border-2 rounded-lg md:rounded-xl focus:ring-1 md:focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all text-sm"
//                               placeholder="+91 XXXXX XXXXX"
//                             />
//                           </div>
//                         </div>

//                         <div>
//                           <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2 flex items-center">
//                             <Mail className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-violet-600" />Email *
//                           </label>
//                           <input
//                             type="email"
//                             required
//                             value={formData.email}
//                             onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                             className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 md:border-2 rounded-lg md:rounded-xl focus:ring-1 md:focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all text-sm"
//                             placeholder="your@email.com"
//                           />
//                         </div>

//                         <div>
//                           <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2 flex items-center">
//                             <Users className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-violet-600" />Gender *
//                           </label>
//                           <div className="grid grid-cols-2 gap-2 md:gap-3">
//                             <label className={`flex items-center justify-center gap-1 md:gap-2 p-2 md:p-4 border rounded-lg md:rounded-xl cursor-pointer transition-all ${formData.gender === 'male'
//                                 ? 'border-blue-600 bg-blue-50 shadow-inner'
//                                 : 'border-gray-200 hover:border-gray-300'
//                               }`}>
//                               <input
//                                 type="radio"
//                                 name="gender"
//                                 value="male"
//                                 checked={formData.gender === 'male'}
//                                 onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
//                                 className="sr-only"
//                                 required
//                               />
//                               <span className="text-xl md:text-2xl">♂</span>
//                               <span className="font-bold text-gray-900 text-xs md:text-sm">Male</span>
//                             </label>
//                             <label className={`flex items-center justify-center gap-1 md:gap-2 p-2 md:p-4 border rounded-lg md:rounded-xl cursor-pointer transition-all ${formData.gender === 'female'
//                                 ? 'border-pink-600 bg-pink-50 shadow-inner'
//                                 : 'border-gray-200 hover:border-gray-300'
//                               }`}>
//                               <input
//                                 type="radio"
//                                 name="gender"
//                                 value="female"
//                                 checked={formData.gender === 'female'}
//                                 onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
//                                 className="sr-only"
//                                 required
//                               />
//                               <span className="text-xl md:text-2xl">♀</span>
//                               <span className="font-bold text-gray-900 text-xs md:text-sm">Female</span>
//                             </label>
//                           </div>
//                         </div>

//                         {bookingType === 'long' ? (
//                           <div>
//                             <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2 flex items-center">
//                               <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-violet-600" />Move-in Date *
//                             </label>
//                             <input
//                               type="date"
//                               required
//                               value={formData.moveInDate}
//                               onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
//                               min={new Date().toISOString().split('T')[0]}
//                               className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 md:border-2 rounded-lg md:rounded-xl focus:ring-1 md:focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all text-sm"
//                             />
//                           </div>
//                         ) : (
//                           <div className="grid md:grid-cols-2 gap-2 md:gap-4">
//                             <div>
//                               <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Check-in *</label>
//                               <input
//                                 type="date"
//                                 required
//                                 min={new Date().toISOString().split('T')[0]}
//                                 value={formData.checkInDate}
//                                 onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
//                                 className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 md:border-2 rounded-lg md:rounded-xl focus:ring-1 md:focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all text-sm"
//                               />
//                             </div>
//                             <div>
//                               <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Check-out *</label>
//                               <input
//                                 type="date"
//                                 required
//                                 min={formData.checkInDate || new Date().toISOString().split('T')[0]}
//                                 value={formData.checkOutDate}
//                                 onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
//                                 className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 md:border-2 rounded-lg md:rounded-xl focus:ring-1 md:focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all text-sm"
//                               />
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}

//                   {/* Step 4: Payment Summary */}
//                   {bookingStep === 4 && (
//                     <div className="space-y-3 md:space-y-5">
//                       <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-2 md:mb-4">
//                         <CreditCard className="w-3 h-3 md:w-5 md:h-5 inline mr-1 md:mr-2 text-violet-600" />
//                         Payment Summary
//                       </h3>

//                       <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg md:rounded-xl p-3 md:p-5 border border-gray-200">
//                         <div className="space-y-1.5 md:space-y-3 mb-2 md:mb-4">
//                           <div className="flex justify-between items-center">
//                             <span className="text-gray-700 font-semibold text-xs md:text-sm">
//                               {bookingType === 'long' ? 'Monthly Rent' : 'Daily Rate'}
//                             </span>
//                             <span className="font-bold text-sm md:text-lg">
//                               ₹{calculateTotal().toLocaleString()}
//                               {bookingType === 'short' && ' total'}
//                             </span>
//                           </div>

//                           {bookingType === 'short' && formData.checkInDate && formData.checkOutDate && (
//                             <div className="text-[10px] md:text-sm text-gray-600">
//                               {Math.ceil((new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / (1000 * 60 * 60 * 24))} days
//                               × ₹{propertyData.dailyRate}/day
//                             </div>
//                           )}

//                           <div className="flex justify-between items-center pt-1.5 md:pt-3 border-t border-gray-300">
//                             <span className="text-gray-700 font-semibold text-xs md:text-sm">Security Deposit</span>
//                             <span className="font-bold text-xs md:text-base">₹{propertyData.securityDeposit.toLocaleString()}</span>
//                           </div>
//                         </div>

//                         <div className="border-t-2 border-gray-300 pt-2 md:pt-4 mt-2 md:mt-4 flex justify-between items-center">
//                           <span className="font-bold text-sm md:text-lg">Total Amount:</span>
//                           <span className="font-bold text-lg md:text-2xl text-violet-600">
//                             ₹{(calculateTotal() + propertyData.securityDeposit).toLocaleString()}
//                           </span>
//                         </div>
//                       </div>

//                       {/* Coupon Code */}
//                       <div className="bg-amber-50 border border-amber-200 md:border-2 rounded-lg md:rounded-xl p-2 md:p-4">
//                         <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Coupon Code</label>
//                         <div className="flex gap-1 md:gap-2">
//                           <input
//                             type="text"
//                             value={formData.couponCode}
//                             onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
//                             placeholder="Enter coupon code"
//                             className="flex-1 px-2 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded md:rounded-lg text-sm"
//                           />
//                           <button
//                             type="button"
//                             onClick={applyCoupon}
//                             className="px-2 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded md:rounded-lg font-bold hover:shadow md:hover:shadow-lg transition-all text-xs md:text-sm"
//                           >
//                             Apply
//                           </button>
//                         </div>
//                         {couponError && <p className="text-red-600 text-[10px] md:text-xs mt-0.5 md:mt-1">{couponError}</p>}
//                         {couponApplied && <p className="text-green-600 text-[10px] md:text-xs mt-0.5 md:mt-1">Coupon applied successfully!</p>}
//                       </div>

//                       {/* Terms Agreement */}
//                       <label className="flex items-start gap-2 md:gap-3 p-2 md:p-4 bg-amber-50 border border-amber-200 md:border-2 rounded-lg md:rounded-xl cursor-pointer hover:border-amber-300 transition-all">
//                         <input
//                           type="checkbox"
//                           checked={formData.agreeToTerms}
//                           onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
//                           className="w-4 h-4 md:w-5 md:h-5 text-violet-600 mt-0.5"
//                           required
//                         />
//                         <div className="text-xs md:text-sm">
//                           <p className="font-bold text-gray-900 mb-0.5 md:mb-1 flex items-center">
//                             <FileText className="w-3 h-3 md:w-4 md:h-4 inline mr-0.5 md:mr-1" />Terms & Conditions *
//                           </p>
//                           <p className="text-gray-700">I agree to the terms and conditions and understand all policies</p>
//                         </div>
//                       </label>
//                     </div>
//                   )}

//                   <div className="flex gap-2 md:gap-3 pt-3 md:pt-6 border-t border-gray-200 md:border-t-2">
//                     {bookingStep > 1 && (
//                       <button
//                         type="button"
//                         onClick={() => setBookingStep(bookingStep - 1)}
//                         className="flex-1 px-3 md:px-5 py-2 md:py-3 border border-gray-300 md:border-2 text-gray-700 rounded-lg md:rounded-xl font-bold hover:border-gray-400 transition-all text-xs md:text-sm"
//                       >
//                         ← Back
//                       </button>
//                     )}
//                     <button
//                       type="submit"
//                       disabled={loading}
//                       className="flex-1 px-3 md:px-5 py-2 md:py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg md:rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed text-xs md:text-sm"
//                     >
//                       {loading ? (
//                         <span className="flex items-center justify-center gap-1 md:gap-2">
//                           <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                           Processing...
//                         </span>
//                       ) : bookingStep === 4 ? (
//                         <span className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm">
//                           🔒 Confirm & Pay ₹{(calculateTotal() + propertyData.securityDeposit).toLocaleString()}
//                         </span>
//                       ) : (
//                         'Continue →'
//                       )}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// app/properties/[slug].page.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { listProperties, getProperty } from "@/lib/propertyApi";
import { listRoomsByProperty } from "@/lib/roomsApi";
import { offerApi } from "@/lib/offerApi";
import { transformPropertyData, transformRoomData } from '@/components/properties/propertyTransformers';
import PropertyDetailView from '@/components/properties/PropertyDetailView';

const loadingFallback = (
  <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
    <div className="text-center">
      <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-sm md:text-lg font-semibold text-gray-700">Loading property details...</p>
    </div>
  </div>
);

function PropertyDetailsContent({ slug }: { slug: string }) {
  const [content, setContent] = useState<React.ReactNode>(loadingFallback);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let propertyData: ReturnType<typeof transformPropertyData> | null = null;
        const numericId = parseInt(slug, 10);

        if (!isNaN(numericId)) {
          const numericResponse = await getProperty(String(numericId));
          console.log(numericResponse.data, "dafshkldhfajshlfjk")
          if (!cancelled && numericResponse.success && numericResponse.data) {
            propertyData = transformPropertyData(numericResponse.data);
          }
        }

        if (!cancelled && !propertyData) {
          const allPropertiesResponse = await listProperties();
          if (allPropertiesResponse.success && allPropertiesResponse.data) {
            const list = Array.isArray((allPropertiesResponse.data as any))
              ? (allPropertiesResponse.data as any)
              : (allPropertiesResponse.data as any)?.data;
            const arr = Array.isArray(list) ? list : [];
            const foundProperty =
              arr.find((p: { slug?: string }) => p.slug === slug) ||
              arr.find(
                (p: { name?: string }) =>
                  (p.name || '').toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
              );
            if (foundProperty) {
              propertyData = transformPropertyData(foundProperty);
            }
          }
        }

        if (cancelled) return;
        if (!propertyData) {
          setContent(
            <div className="min-h-screen flex items-center justify-center p-4">
              <p className="text-gray-700">Property not found.</p>
            </div>
          );
          return;
        }

        const [roomsResponse, offersResponse] = await Promise.allSettled([
          listRoomsByProperty(Number(propertyData.id)),
          offerApi.getAll()
        ]);

        const rooms =
          roomsResponse.status === 'fulfilled' && roomsResponse.value.success
            ? (roomsResponse.value.data?.map(transformRoomData) || [])
            : [];
        const offers = offersResponse.status === 'fulfilled' ? offersResponse.value : [];

        if (cancelled) return;
        setContent(
          <PropertyDetailView
            propertyData={{ ...propertyData, rooms }}
            offers={offers}
          />
        );
      } catch (error) {
        console.error('Error loading property:', error);
        if (cancelled) return;
        const fallbackData = transformPropertyData({
          id: slug,
          name: slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          area: 'Location information',
          address: 'Address not available',
          description: 'Property details loading...',
          photo_urls: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
            'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
          ],
          total_beds: 0,
          occupied_beds: 0,
          starting_price: 0,
          security_deposit: 0,
          rating: null,
          property_manager_name: 'Manager not available',
          property_manager_phone: '',
          services: []
        });
        setContent(
          <PropertyDetailView
            propertyData={{ ...fallbackData, rooms: [] }}
            offers={[]}
          />
        );
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return <>{content}</>;
}

export default function PropertyPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  if (!slug) return null;
  return <PropertyDetailsContent slug={slug} />;
}