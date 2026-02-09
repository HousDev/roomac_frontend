// // app/properties/page.tsx - Server Component
// import { Suspense } from "react";
// import PropertiesClient from "./PropertiesClient";
// import { listProperties } from "@/lib/propertyApi";
// import LoadingSpinner from "@/componene";

// async function fetchInitialProperties() {
//   try {
//     const result = await listProperties({
//       page: 1,
//       pageSize: 100,
//       is_active: true,
//     });
    
//     if (result.success && result.data) {
//       return result.data.data;
//     }
    
//     console.warn("⚠️ No properties data returned:", result.message);
//     return [];
//   } catch (error) {
//     console.error("❌ Error fetching initial properties:", error);
//     return [];
//   }
// }

// export default async function PropertiesPage() {
//   const initialProperties = await fetchInitialProperties();
  
//   return (
//     <Suspense fallback={<LoadingSpinner />}>
//       <PropertiesClient initialProperties={initialProperties} />
//     </Suspense>
//   );
// }