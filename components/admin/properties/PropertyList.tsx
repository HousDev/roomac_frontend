// components/admin/properties/PropertyList.tsx
import { listProperties } from "@/lib/propertyApi";
import PropertyCardView from "./PropertyCardView";
import PropertyTableView from "./PropertyTableView";

interface PropertyListProps {
  viewMode: "card" | "table";
  searchQuery?: string;
  statusFilter?: string;
  tagFilter?: string;
}

export default async function PropertyList({ 
  viewMode = "card",
  searchQuery = "",
  statusFilter = "all",
  tagFilter = "all"
}: PropertyListProps) {

  
  // Fetch data on SERVER
  const response = await listProperties({
    page: 1,
    pageSize: 200,
    search: searchQuery || undefined,
    is_active: statusFilter === "all" ? undefined : statusFilter === "true",
    tags: tagFilter === "all" ? undefined : tagFilter,
  });

 
  
  if (!response.success || !response.data) {
    return (
      <div className="text-center py-16">
        <div className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Failed to load properties
        </h3>
        <p className="text-gray-500">
          {response.message || "Please try again"}
        </p>
      </div>
    );
  }

  const properties = response.data.data || [];
  
  if (properties.length > 0) {
    console.log('First property from API:', {
      id: properties[0].id,
      name: properties[0].name,
      tags: properties[0].tags,
      tagsType: typeof properties[0].tags,
      isArray: Array.isArray(properties[0].tags)
    });
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Properties Found
        </h3>
        <p className="text-gray-500">
          {searchQuery || statusFilter !== 'all' || tagFilter !== 'all' 
            ? 'Try adjusting your filters'
            : 'Get started by adding your first property'}
        </p>
      </div>
    );
  }

  // Pass data to appropriate view component
  if (viewMode === "card") {
    return <PropertyCardView properties={properties} />;
  } else {
    return <PropertyTableView initialProperties={properties} />;
  }
}