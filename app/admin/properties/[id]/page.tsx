

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