import { request } from "./api";

export const getAllMappings = () => 
  request("/api/category-subcategory-map", { method: "GET" });

export const getAllMappingsGrouped = () => 
  request("/api/category-subcategory-map/grouped", { method: "GET" });

export const getSubcategoriesByCategory = (category_id: string) =>
  request(`/api/category-subcategory-map/category/${category_id}`, { method: "GET" });

export const bulkSaveMappings = (data: {
  category_id: string;
  category_name: string;
  subcategories: Array<{ subcategory_id: string; subcategory_name: string }>;
}) =>
  request("/api/category-subcategory-map/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const deleteMapping = (id: number) =>
  request(`/api/category-subcategory-map/${id}`, { method: "DELETE" });

export const deleteMappingsByCategory = (category_id: string) =>
  request(`/api/category-subcategory-map/category/${category_id}`, { method: "DELETE" });