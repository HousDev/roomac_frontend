"use client";  // ✅ ADD THIS AT THE VERY TOP

import { useState, useEffect } from "react";
import { listProperties, PropertyListResponse } from "@/lib/propertyApi";
import PropertyListClient from "@/components/admin/properties/PropertyListClient";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/authContext";
import { Navigate } from "react-router-dom";

// Loading component
function PropertiesLoading() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="p-4">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-xl rounded-2xl">
          <div className="animate-pulse">
            <div className="h-20 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-500" />
            <CardContent className="p-5">
              <div className="h-10 bg-gray-200 rounded mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 bg-gray-200 rounded-lg" />
                ))}
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  const { can, isAuthenticated, loading: authLoading, user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Debug - log user when available
  useEffect(() => {
    if (user) {
      console.log('🔍 PropertiesPage - User loaded:', { 
        email: user.email, 
        staff_id: user.staff_id,
        role: user.role 
      });
    }
  }, [user]);

  useEffect(() => {
    // ✅ Only fetch properties after auth is loaded
    if (!authLoading && isAuthenticated) {
      const fetchProperties = async () => {
        setLoading(true);
        try {
          console.log('🔍 Fetching properties...');
          const res = await listProperties({ page: 1, pageSize: 200 });
          console.log('🔍 Properties response:', res?.data?.length, 'properties');
          if (res && res.success && res.data) {
            setProperties(Array.isArray(res.data) ? res.data : []);
          }
        } catch (err) {
          console.error("Failed to fetch properties:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchProperties();
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading) {
    return <PropertiesLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!can("view_properties")) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (loading) {
    return <PropertiesLoading />;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50/30">
      <PropertyListClient initialProperties={properties} />
    </div>
  );
}