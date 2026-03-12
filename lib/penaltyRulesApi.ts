// lib/penaltyRulesApi.ts
import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export const penaltyRulesApi = {
  getAll: async (params?: {
    category?: string;
    from?: string;
    to?: string;
  }) => {
    let url = "/api/penalty-rules";
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.category) queryParams.append("category", params.category);
      if (params.from) queryParams.append("from", params.from);
      if (params.to) queryParams.append("to", params.to);
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
    }
    return apiGet(url);
  },

  getById: (id: string) => 
    apiGet(`/api/penalty-rules/${id}`),

  getPenalty: (
    category: string,
    fromCondition: string,
    toCondition: string
  ) =>
    apiGet(
      `/api/penalty-rules/calculate?category=${encodeURIComponent(category)}&from=${encodeURIComponent(fromCondition)}&to=${encodeURIComponent(toCondition)}`
    ),

  create: (rule: any) =>
    apiPost("/api/penalty-rules", rule),

  update: (id: string, rule: any) =>
    apiPut(`/api/penalty-rules/${id}`, rule),

  delete: (id: string) =>
    apiDelete(`/api/penalty-rules/${id}`),

  bulkDelete: (ids: string[]) =>
    apiDelete("/api/penalty-rules/bulk", { ids }),
};