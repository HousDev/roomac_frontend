// import { request } from "./api";

// export const getAllMappings = () => 
//   request("/api/category-subcategory-map", { method: "GET" });

// export const getAllMappingsGrouped = () => 
//   request("/api/category-subcategory-map/grouped", { method: "GET" });

// export const getSubcategoriesByCategory = (category_id: string) =>
//   request(`/api/category-subcategory-map/category/${category_id}`, { method: "GET" });

// export const bulkSaveMappings = (data: {
//   category_id: string;
//   category_name: string;
//   subcategories: Array<{ subcategory_id: string; subcategory_name: string }>;
// }) =>
//   request("/api/category-subcategory-map/bulk", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   });

// export const deleteMapping = (id: number) =>
//   request(`/api/category-subcategory-map/${id}`, { method: "DELETE" });

// export const deleteMappingsByCategory = (category_id: string) =>
//   request(`/api/category-subcategory-map/category/${category_id}`, { method: "DELETE" });


// api/categorySubcategoryMapApi.ts

import { request } from "./api";

export type MapType = "expense" | "inventory";

export const getAllMappings = (map_type: MapType = "expense") =>
  request(`/api/category-subcategory-map?map_type=${map_type}`, { method: "GET" });

export const getAllMappingsGrouped = (map_type: MapType = "expense") =>
  request(`/api/category-subcategory-map/grouped?map_type=${map_type}`, { method: "GET" });

export const getSubcategoriesByCategory = (category_id: string, map_type: MapType = "expense") =>
  request(`/api/category-subcategory-map/category/${category_id}?map_type=${map_type}`, { method: "GET" });

export const bulkSaveMappings = (data: {
  category_id: string;
  category_name: string;
  subcategories: Array<{ subcategory_id: string; subcategory_name: string }>;
  map_type?: MapType;
}) =>
  request("/api/category-subcategory-map/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ map_type: "expense", ...data }),
  });

export const deleteMapping = (id: number) =>
  request(`/api/category-subcategory-map/${id}`, { method: "DELETE" });

export const deleteMappingsByCategory = (category_id: string, map_type: MapType = "expense") =>
  request(`/api/category-subcategory-map/category/${category_id}?map_type=${map_type}`, { method: "DELETE" });


export const getInventoryMappingsGrouped = () =>
  request(`/api/category-subcategory-map/grouped?map_type=inventory`, { method: "GET" });