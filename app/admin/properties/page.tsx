// app/admin/properties/page.tsx - SERVER COMPONENT (NEW)
import { useState, useEffect } from "react";
import { listProperties, PropertyListResponse } from "@/lib/propertyApi";
import PropertyListClient from "@/components/admin/properties/PropertyListClient";
import PropertyHeader from "@/components/admin/properties/PropertyHeader";
import PropertyFilters from "@/components/admin/properties/PropertyFilters";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/admin/data-table";

// Loading component
function PropertiesLoading() {
  return (
    <div className=" bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="p-4">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-xl  rounded-2xl">
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
  const [properties, setProperties] = useState<(PropertyListResponse & any[]) | any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    listProperties({ page: 1, pageSize: 200 })
      .then((res) => {
        if (res && res.success && res.data) {
          setProperties(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch((err) => console.error("Server-side property fetch failed:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PropertiesLoading />;
  return (
    <div className=" bg-gradient-to-br from-gray-50 to-blue-50/30">
      <PropertyListClient initialProperties={properties} />
    </div>
  );
}