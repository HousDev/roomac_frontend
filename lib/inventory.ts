import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";

/* =========================
   Assets API
========================= */

export const assetsApi = {

  getAll: () => apiGet("/api/assets"),

  create: (asset: any) =>
    apiPost("/api/assets", asset),

  update: (id: string, asset: any) =>
    apiPut(`/api/assets/${id}`, asset),

  delete: (id: string) =>
    apiDelete(`/api/assets/${id}`)
};


/* =========================
   Tenant Handovers
========================= */

export const tenantHandoversApi = {

  getAll: () =>
    apiGet("/api/tenant-handovers"),

  getById: (id: string) =>
    apiGet(`/api/tenant-handovers/${id}`),

  create: (data: any) =>
    apiPost("/api/tenant-handovers", data),

  update: (id: string, data: any) =>
    apiPut(`/api/tenant-handovers/${id}`, data),

  delete: (id: string) =>
    apiDelete(`/api/tenant-handovers/${id}`)
};


/* =========================
   Handover Items
========================= */

export const handoverItemsApi = {

  getByHandoverId: (handoverId: string) =>
    apiGet(`/api/handover-items/${handoverId}`),

  create: (item: any) =>
    apiPost("/api/handover-items", item),

  createBatch: (items: any[]) =>
    apiPost("/api/handover-items/batch", items),

  update: (id: string, item: any) =>
    apiPut(`/api/handover-items/${id}`, item),

  delete: (id: string) =>
    apiDelete(`/api/handover-items/${id}`)
};


/* =========================
   Penalty Rules
========================= */

export const penaltyRulesApi = {

  getAll: () =>
    apiGet("/api/penalty-rules"),

  getPenalty: (
    category: string,
    fromCondition: string,
    toCondition: string
  ) =>
    apiGet(
      `/api/penalty-rules?category=${category}&from=${fromCondition}&to=${toCondition}`
    ),

  create: (rule: any) =>
    apiPost("/api/penalty-rules", rule),

  update: (id: string, rule: any) =>
    apiPut(`/api/penalty-rules/${id}`, rule),

  delete: (id: string) =>
    apiDelete(`/api/penalty-rules/${id}`)
};


/* =========================
   Moveout Inspections
========================= */

export const moveoutInspectionsApi = {

  getAll: () =>
    apiGet("/api/moveout-inspections"),

  getById: (id: string) =>
    apiGet(`/api/moveout-inspections/${id}`),

  create: (data: any) =>
    apiPost("/api/moveout-inspections", data),

  update: (id: string, data: any) =>
    apiPut(`/api/moveout-inspections/${id}`, data),

  delete: (id: string) =>
    apiDelete(`/api/moveout-inspections/${id}`)
};


/* =========================
   Inspection Items
========================= */

export const inspectionItemsApi = {

  getByInspectionId: (id: string) =>
    apiGet(`/api/inspection-items/${id}`),

  create: (item: any) =>
    apiPost("/api/inspection-items", item),

  createBatch: (items: any[]) =>
    apiPost("/api/inspection-items/batch", items),

  update: (id: string, item: any) =>
    apiPut(`/api/inspection-items/${id}`, item),

  delete: (id: string) =>
    apiDelete(`/api/inspection-items/${id}`)
};


/* =========================
   Settlements
========================= */

export const settlementsApi = {

  getAll: () =>
    apiGet("/api/settlements"),

  create: (data: any) =>
    apiPost("/api/settlements", data),

  update: (id: string, data: any) =>
    apiPut(`/api/settlements/${id}`, data),

  delete: (id: string) =>
    apiDelete(`/api/settlements/${id}`)
};


/* =========================
   Visitor Logs
========================= */

export const visitorLogsApi = {

  getAll: () =>
    apiGet("/api/visitor-logs"),

  create: (log: any) =>
    apiPost("/api/visitor-logs", log),

  update: (id: string, log: any) =>
    apiPut(`/api/visitor-logs/${id}`, log),

  delete: (id: string) =>
    apiDelete(`/api/visitor-logs/${id}`),

  checkOut: (id: string, exitTime: string) =>
    apiPut(`/api/visitor-logs/checkout/${id}`, { exitTime })
};


/* =========================
   Visitor Restrictions
========================= */

export const visitorRestrictionsApi = {

  getAll: () =>
    apiGet("/api/visitor-restrictions"),

  create: (data: any) =>
    apiPost("/api/visitor-restrictions", data),

  update: (id: string, data: any) =>
    apiPut(`/api/visitor-restrictions/${id}`, data),

  delete: (id: string) =>
    apiDelete(`/api/visitor-restrictions/${id}`)
};


/* =========================
   Material Purchases
========================= */

export const materialPurchasesApi = {

  getAll: () =>
    apiGet("/api/material-purchases"),

  getById: (id: string) =>
    apiGet(`/api/material-purchases/${id}`),

  create: (data: any) =>
    apiPost("/api/material-purchases", data),

  update: (id: string, data: any) =>
    apiPut(`/api/material-purchases/${id}`, data),

  delete: (id: string) =>
    apiDelete(`/api/material-purchases/${id}`)
};


/* =========================
   Inventory Stock
========================= */

export const inventoryStockApi = {

  getAll: () =>
    apiGet("/api/inventory-stock"),

  create: (data: any) =>
    apiPost("/api/inventory-stock", data),

  update: (id: string, data: any) =>
    apiPut(`/api/inventory-stock/${id}`, data),

  delete: (id: string) =>
    apiDelete(`/api/inventory-stock/${id}`)
};


/* =========================
   Purchase Items
========================= */

export const purchaseItemsApi = {

  getByPurchaseId: (id: string) =>
    apiGet(`/api/purchase-items/${id}`),

  create: (item: any) =>
    apiPost("/api/purchase-items", item),

  createBatch: (items: any[]) =>
    apiPost("/api/purchase-items/batch", items),

  update: (id: string, item: any) =>
    apiPut(`/api/purchase-items/${id}`, item),

  delete: (id: string) =>
    apiDelete(`/api/purchase-items/${id}`)
};


/* =========================
   Purchase Payments
========================= */

export const purchasePaymentsApi = {

  getByPurchaseId: (id: string) =>
    apiGet(`/api/purchase-payments/${id}`),

  create: (payment: any) =>
    apiPost("/api/purchase-payments", payment),

  update: (id: string, payment: any) =>
    apiPut(`/api/purchase-payments/${id}`, payment),

  delete: (id: string) =>
    apiDelete(`/api/purchase-payments/${id}`)
};