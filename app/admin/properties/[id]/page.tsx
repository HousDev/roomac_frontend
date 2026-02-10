// "use client";

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import {
//     ArrowLeft,
//     Building2,
//     MapPin,
//     Bed,
//     DoorOpen,
//     IndianRupee,
//     Shield,
//     User,
//     Phone,
//     Calendar,
//     CheckCircle2,
//     X,
//     ChevronLeft,
//     ChevronRight,
//     Loader2
// } from 'lucide-react';
// import { toast } from 'sonner';

// // Add your API function to fetch a single property
// import { getProperty } from '@/lib/propertyApi';

// type Property = {
//     id: string;
//     name: string;
//     city_id?: string;
//     area: string;
//     address: string;
//     total_rooms: number;
//     total_beds: number;
//     occupied_beds?: number;
//     starting_price: number;
//     security_deposit: number;
//     description?: string;
//     property_manager_name: string;
//     property_manager_phone: string;
//     amenities: string[];
//     services: string[];
//     photo_urls: string[];
//     property_rules?: string;
//     is_active: boolean;
//     created_at?: string;
//     updated_at?: string | null;
// };

// const PropertyDetailsPage = () => {
//     const params = useParams();
//     const router = useRouter();
//     const [property, setProperty] = useState<Property | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [currentImageIndex, setCurrentImageIndex] = useState(0);

//     const propertyId = params.id as string;

//     useEffect(() => {
//         if (propertyId) {
//             loadProperty();
//         }
//     }, [propertyId]);

//     const loadProperty = async () => {
//         setLoading(true);
//         try {
//             const res = await getProperty(propertyId);
//             if (res && res.success && res.data) {
//                 setProperty(res.data);
//             } else {
//                 toast.error(res?.message || "Failed to load property details");
//                 router.back();
//             }
//         } catch (err) {
//             console.error("loadProperty error:", err);
//             toast.error("Failed to load property details");
//             router.back();
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
//                 <div className="text-center">
//                     <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
//                     <p className="text-slate-600">Loading property details...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (!property) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
//                 <div className="text-center">
//                     <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
//                     <h2 className="text-2xl font-bold text-slate-700 mb-2">Property Not Found</h2>
//                     <p className="text-slate-600 mb-6">The property you're looking for doesn't exist.</p>
//                     <button
//                         onClick={() => router.back()}
//                         className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mx-auto"
//                     >
//                         <ArrowLeft className="h-5 w-5" />
//                         Back to Properties
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     const nextImage = () => {
//         if (property.photo_urls.length > 0) {
//             setCurrentImageIndex((prev) =>
//                 prev === property.photo_urls.length - 1 ? 0 : prev + 1
//             );
//         }
//     };

//     const prevImage = () => {
//         if (property.photo_urls.length > 0) {
//             setCurrentImageIndex((prev) =>
//                 prev === 0 ? property.photo_urls.length - 1 : prev - 1
//             );
//         }
//     };

//     const occupancyPercentage = property.occupied_beds
//         ? (property.occupied_beds / property.total_beds) * 100
//         : 0;
//     const availableBeds = property.total_beds - (property.occupied_beds || 0);

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
//             {/* Header with Back Button */}
//             <div className="bg-white shadow-sm sticky top-0 z-10">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//                     <button
//                         onClick={() => router.back()}
//                         className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group"
//                     >
//                         <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
//                         <span className="font-medium">Back to Properties</span>
//                     </button>
//                 </div>
//             </div>

//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
//                 {/* Main Content Grid */}
//                 <div className="grid lg:grid-cols-3 gap-6">
//                     {/* Left Column - Main Details */}
//                     <div className="lg:col-span-2 space-y-6">
//                         {/* Image Gallery */}
//                         <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
//                             <div className="relative aspect-video bg-slate-200">
//                                 {property.photo_urls && property.photo_urls.length > 0 ? (
//                                     <>
//                                         <img
//                                             src={`${process.env.VITE_API_URL}${property.photo_urls[currentImageIndex]}`}
//                                             alt={`${property.name} - Image ${currentImageIndex + 1}`}
//                                             className="w-full h-full object-cover"
//                                         />

//                                         {/* Image Navigation */}
//                                         {property.photo_urls.length > 1 && (
//                                             <>
//                                                 <button
//                                                     onClick={prevImage}
//                                                     className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
//                                                 >
//                                                     <ChevronLeft className="h-6 w-6" />
//                                                 </button>
//                                                 <button
//                                                     onClick={nextImage}
//                                                     className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
//                                                 >
//                                                     <ChevronRight className="h-6 w-6" />
//                                                 </button>

//                                                 {/* Image Indicators */}
//                                                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
//                                                     {property.photo_urls.map((_, idx) => (
//                                                         <button
//                                                             key={idx}
//                                                             onClick={() => setCurrentImageIndex(idx)}
//                                                             className={`h-2 rounded-full transition-all ${idx === currentImageIndex
//                                                                 ? 'w-8 bg-white'
//                                                                 : 'w-2 bg-white/50 hover:bg-white/75'
//                                                                 }`}
//                                                         />
//                                                     ))}
//                                                 </div>
//                                             </>
//                                         )}
//                                     </>
//                                 ) : (
//                                     <div className="w-full h-full flex items-center justify-center">
//                                         <Building2 className="h-24 w-24 text-slate-400" />
//                                     </div>
//                                 )}

//                                 {/* Status Badge */}
//                                 <div className="absolute top-4 right-4">
//                                     <span className={`px-4 py-2 rounded-full text-sm font-semibold ${property.is_active
//                                         ? 'bg-green-500 text-white'
//                                         : 'bg-slate-500 text-white'
//                                         }`}>
//                                         {property.is_active ? 'Active' : 'Inactive'}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Property Info Card */}
//                         <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
//                             <div className="flex items-start justify-between mb-4">
//                                 <div>
//                                     <h1 className="text-3xl font-bold text-slate-800 mb-2">{property.name}</h1>
//                                     <div className="flex items-center gap-2 text-slate-600">
//                                         <MapPin className="h-5 w-5 text-blue-600" />
//                                         <span className="text-lg">{property.area}, {property.city_id || 'N/A'}</span>
//                                     </div>
//                                 </div>
//                                 <Building2 className="h-12 w-12 text-blue-600" />
//                             </div>

//                             <div className="border-t pt-4 mb-6">
//                                 <p className="text-slate-700 leading-relaxed">{property.description || 'No description available.'}</p>
//                             </div>

//                             {/* Address */}
//                             <div className="bg-slate-50 rounded-xl p-4 mb-6">
//                                 <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
//                                     <MapPin className="h-4 w-4" />
//                                     Full Address
//                                 </h3>
//                                 <p className="text-slate-600">{property.address || 'No address provided.'}</p>
//                             </div>

//                             {/* Stats Grid */}
//                             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
//                                 <div className="bg-blue-50 rounded-xl p-4 text-center">
//                                     <DoorOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
//                                     <p className="text-2xl font-bold text-slate-800">{property.total_rooms}</p>
//                                     <p className="text-sm text-slate-600">Total Rooms</p>
//                                 </div>
//                                 <div className="bg-purple-50 rounded-xl p-4 text-center">
//                                     <Bed className="h-8 w-8 text-purple-600 mx-auto mb-2" />
//                                     <p className="text-2xl font-bold text-slate-800">{property.total_beds}</p>
//                                     <p className="text-sm text-slate-600">Total Beds</p>
//                                 </div>
//                                 <div className="bg-green-50 rounded-xl p-4 text-center">
//                                     <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
//                                     <p className="text-2xl font-bold text-slate-800">{availableBeds}</p>
//                                     <p className="text-sm text-slate-600">Available</p>
//                                 </div>
//                                 <div className="bg-orange-50 rounded-xl p-4 text-center">
//                                     <User className="h-8 w-8 text-orange-600 mx-auto mb-2" />
//                                     <p className="text-2xl font-bold text-slate-800">{property.occupied_beds || 0}</p>
//                                     <p className="text-sm text-slate-600">Occupied</p>
//                                 </div>
//                             </div>

//                             {/* Occupancy Bar */}
//                             <div className="mb-6">
//                                 <div className="flex justify-between items-center mb-2">
//                                     <span className="text-sm font-medium text-slate-700">Occupancy Rate</span>
//                                     <span className="text-sm font-bold text-slate-800">{occupancyPercentage.toFixed(1)}%</span>
//                                 </div>
//                                 <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
//                                     <div
//                                         className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
//                                         style={{ width: `${occupancyPercentage}%` }}
//                                     />
//                                 </div>
//                             </div>

//                             {/* Amenities */}
//                             {property.amenities && property.amenities.length > 0 && (
//                                 <div className="mb-6">
//                                     <h3 className="font-bold text-lg text-slate-800 mb-3">Amenities</h3>
//                                     <div className="flex flex-wrap gap-2">
//                                         {property.amenities.map((amenity, idx) => (
//                                             <span
//                                                 key={idx}
//                                                 className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
//                                             >
//                                                 {amenity}
//                                             </span>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Services */}
//                             {property.services && property.services.length > 0 && (
//                                 <div className="mb-6">
//                                     <h3 className="font-bold text-lg text-slate-800 mb-3">Services Provided</h3>
//                                     <div className="flex flex-wrap gap-2">
//                                         {property.services.map((service, idx) => (
//                                             <span
//                                                 key={idx}
//                                                 className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium"
//                                             >
//                                                 {service}
//                                             </span>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Property Rules */}
//                             {property.property_rules && (
//                                 <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-4">
//                                     <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
//                                         <Shield className="h-5 w-5 text-amber-600" />
//                                         Property Rules
//                                     </h3>
//                                     <p className="text-slate-700">{property.property_rules}</p>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Right Column - Sidebar */}
//                     <div className="space-y-6">
//                         {/* Pricing Card */}
//                         <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white sticky top-24">
//                             <h3 className="text-lg font-semibold mb-4">Pricing Details</h3>

//                             <div className="space-y-4">
//                                 <div className="bg-white/10 rounded-xl p-4">
//                                     <p className="text-blue-100 text-sm mb-1">Starting Price</p>
//                                     <div className="flex items-baseline gap-1">
//                                         <IndianRupee className="h-6 w-6" />
//                                         <span className="text-3xl font-bold">{property.starting_price.toLocaleString()}</span>
//                                         <span className="text-blue-100">/month</span>
//                                     </div>
//                                 </div>

//                                 <div className="bg-white/10 rounded-xl p-4">
//                                     <p className="text-blue-100 text-sm mb-1">Security Deposit</p>
//                                     <div className="flex items-baseline gap-1">
//                                         <Shield className="h-5 w-5" />
//                                         <span className="text-2xl font-bold">{property.security_deposit.toLocaleString()}</span>
//                                     </div>
//                                 </div>
//                             </div>

//                             <button className="w-full bg-white text-blue-600 font-bold py-3 rounded-xl mt-6 hover:bg-blue-50 transition">
//                                 Book Now
//                             </button>
//                         </div>

//                         {/* Manager Contact Card */}
//                         <div className="bg-white rounded-2xl shadow-lg p-6">
//                             <h3 className="font-bold text-lg text-slate-800 mb-4">Property Manager</h3>

//                             <div className="space-y-3">
//                                 <div className="flex items-center gap-3">
//                                     <div className="bg-blue-100 rounded-full p-2">
//                                         <User className="h-5 w-5 text-blue-600" />
//                                     </div>
//                                     <div>
//                                         <p className="text-sm text-slate-600">Name</p>
//                                         <p className="font-semibold text-slate-800">{property.property_manager_name || 'Not assigned'}</p>
//                                     </div>
//                                 </div>

//                                 <div className="flex items-center gap-3">
//                                     <div className="bg-green-100 rounded-full p-2">
//                                         <Phone className="h-5 w-5 text-green-600" />
//                                     </div>
//                                     <div>
//                                         <p className="text-sm text-slate-600">Phone</p>
//                                         {property.property_manager_phone ? (
//                                             <a
//                                                 href={`tel:${property.property_manager_phone}`}
//                                                 className="font-semibold text-blue-600 hover:underline"
//                                             >
//                                                 {property.property_manager_phone}
//                                             </a>
//                                         ) : (
//                                             <p className="font-semibold text-slate-400">Not provided</p>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>

//                             {property.property_manager_phone && (
//                                 <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl mt-4 transition flex items-center justify-center gap-2">
//                                     <Phone className="h-4 w-4" />
//                                     Contact Manager
//                                 </button>
//                             )}
//                         </div>

//                         {/* Timeline Card */}
//                         <div className="bg-white rounded-2xl shadow-lg p-6">
//                             <h3 className="font-bold text-lg text-slate-800 mb-4">Timeline</h3>

//                             <div className="space-y-3">
//                                 <div className="flex items-start gap-3">
//                                     <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
//                                     <div>
//                                         <p className="text-sm text-slate-600">Created</p>
//                                         <p className="font-medium text-slate-800">
//                                             {property.created_at ? new Date(property.created_at).toLocaleDateString('en-IN', {
//                                                 day: 'numeric',
//                                                 month: 'long',
//                                                 year: 'numeric'
//                                             }) : 'N/A'}
//                                         </p>
//                                     </div>
//                                 </div>

//                                 {property.updated_at && (
//                                     <div className="flex items-start gap-3">
//                                         <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
//                                         <div>
//                                             <p className="text-sm text-slate-600">Last Updated</p>
//                                             <p className="font-medium text-slate-800">
//                                                 {new Date(property.updated_at).toLocaleDateString('en-IN', {
//                                                     day: 'numeric',
//                                                     month: 'long',
//                                                     year: 'numeric'
//                                                 })}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default PropertyDetailsPage;

/// app/admin/properties/[id]/page.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProperty } from "@/lib/propertyApi";
import PropertyDetailsClient from "@/components/admin/properties/PropertyDetailsClient";
import { notFound } from "@/src/compat/next-navigation";

// Loading component
function PropertyDetailsLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
            <div className="text-center">
                <div className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full" />
                <p className="text-slate-600">Loading property details...</p>
            </div>
        </div>
    );
}

type NormalizedProperty = {
    id: string;
    name: string;
    area: string;
    address: string;
    total_rooms: number;
    total_beds: number;
    occupied_beds: number;
    starting_price: number;
    security_deposit: number;
    description: string;
    property_manager_name: string;
    property_manager_phone: string;
    amenities: string[];
    services: string[];
    photo_urls: string[];
    property_rules: string;
    is_active: boolean;
};

function normalizeProperty(data: any): NormalizedProperty {
    return {
        ...data,
        id: String(data.id || ''),
        name: data.name || '',
        area: data.area || '',
        address: data.address || '',
        total_rooms: Number(data.total_rooms) || 0,
        total_beds: Number(data.total_beds) || 0,
        occupied_beds: Number(data.occupied_beds) || 0,
        starting_price: Number(data.starting_price) || 0,
        security_deposit: Number(data.security_deposit) || 0,
        description: data.description || '',
        property_manager_name: data.property_manager_name || '',
        property_manager_phone: data.property_manager_phone || '',
        amenities: Array.isArray(data.amenities) ? data.amenities : [],
        services: Array.isArray(data.services) ? data.services : [],
        photo_urls: Array.isArray(data.photo_urls) ? data.photo_urls : [],
        property_rules: data.property_rules || '',
        is_active: Boolean(data.is_active),
    };
}

export default function PropertyDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [property, setProperty] = useState<NormalizedProperty | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!id) return;
        getProperty(id)
            .then((res) => {
                if (res && res.success && res.data) {
                    setProperty(normalizeProperty(res.data));
                } else {
                    setFailed(true);
                }
            })
            .catch((error) => {
                console.error("Failed to fetch property:", error);
                setFailed(true);
            });
    }, [id]);

    if (failed) {
        notFound();
        return null;
    }
    if (!property) return <PropertyDetailsLoading />;
    return <PropertyDetailsClient initialProperty={property} />;
}