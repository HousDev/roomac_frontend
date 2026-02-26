// lib/reportApi.ts
import { request } from "@/lib/api";

// Types
export interface ReportFilters {
  reportType: 'revenue' | 'occupancy' | 'payments' | 'tenants' | 'expenses';
  startDate: string;
  endDate: string;
  propertyId: string | 'all';
}

export interface RevenueSummary {
  totalRevenue: number;
  rentRevenue: number;
  depositRevenue: number;
  addonRevenue: number;
  paymentCount: number;
  rentCount: number;
  depositCount: number;
  addonCount: number;
  byPaymentMethod?: Record<string, number>;
  dailyBreakdown?: Array<{ date: string; amount: number }>;
}

export interface PaymentSummary {
  totalAmount: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  completedAmount: number;
  pendingAmount: number;
  failedAmount: number;
  refundedAmount: number;
  byMethod?: Record<string, { count: number; amount: number }>;
}

export interface TenantSummary {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  withActiveBookings: number;
  maleCount: number;
  femaleCount: number;
  otherCount: number;
  byOccupation?: Record<string, number>;
  byCity?: Record<string, number>;
  newTenantsThisMonth?: number;
}

export interface OccupancySummary {
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  maintenanceRooms: number;
  occupancyRate: string;
  potentialRevenue: number;
  actualRevenue: number;
  byProperty?: Record<string, { total: number; occupied: number; rate: number }>;
  byRoomType?: Record<string, { total: number; occupied: number }>;
}

export interface ReportData {
  payments?: any[];
  tenants?: any[];
  rooms?: any[];
  summary: RevenueSummary | PaymentSummary | TenantSummary | OccupancySummary;
  meta?: {
    generatedAt: string;
    dateRange: { start: string; end: string };
    property?: { id: string; name: string };
  };
}

export interface DashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  avgOccupation: number;
  occupationGrowth: number;
  netProfit: number;
  profitGrowth: number;
  totalTenants: number;
  totalProperties: number;
  occupancyRate: number;
  collectionRate: number;
  pendingPayments: number;
  pendingAmount: number;
  upcomingCheckouts: number;
  maintenanceRequests: number;
}

export interface PropertyOption {
  id: string;
  name: string;
  address: string;
  city: string;
  roomCount?: number;
  tenantCount?: number;
}

// Cache for properties
let propertiesCache: PropertyOption[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch all properties with caching
export async function fetchProperties(forceRefresh = false): Promise<PropertyOption[]> {
  const now = Date.now();
  
  if (!forceRefresh && propertiesCache && (now - lastFetchTime) < CACHE_DURATION) {
    return propertiesCache;
  }

  try {
    const response = await request<any>('/api/properties?is_active=true&pageSize=1000');
    
    if (response.success && response.data) {
      // Handle different response structures
      const propertiesData = response.data.data || response.data;
      
      propertiesCache = Array.isArray(propertiesData) 
        ? propertiesData.map((p: any) => ({
            id: p.id.toString(),
            name: p.name,
            address: p.address || '',
            city: p.city_id || p.city || '',
            roomCount: p.total_rooms || 0,
            tenantCount: p.occupied_beds || 0
          }))
        : [];
      
      lastFetchTime = now;
      return propertiesCache;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

// Dashboard stats with property filter
export async function getDashboardStats(filters?: Partial<ReportFilters>): Promise<DashboardStats> {
  try {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.propertyId && filters.propertyId !== 'all') params.append('propertyId', filters.propertyId);

    const response = await request<any>(`/api/reports/dashboard-stats?${params.toString()}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    // Return default stats if API fails
    return getDefaultDashboardStats();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return getDefaultDashboardStats();
  }
}

function getDefaultDashboardStats(): DashboardStats {
  return {
    totalRevenue: 0,
    revenueGrowth: 0,
    avgOccupation: 0,
    occupationGrowth: 0,
    netProfit: 0,
    profitGrowth: 0,
    totalTenants: 0,
    totalProperties: 0,
    occupancyRate: 0,
    collectionRate: 0,
    pendingPayments: 0,
    pendingAmount: 0,
    upcomingCheckouts: 0,
    maintenanceRequests: 0
  };
}

// Generate reports with property filter
export async function generateRevenueReport(filters: ReportFilters): Promise<ReportData> {
  try {
    const params = new URLSearchParams({
      startDate: filters.startDate,
      endDate: filters.endDate
    });
    
    if (filters.propertyId && filters.propertyId !== 'all') {
      params.append('propertyId', filters.propertyId);
    }

    const response = await request<any>(`/api/reports/revenue?${params.toString()}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to generate revenue report');
  } catch (error) {
    console.error('Error generating revenue report:', error);
    throw error;
  }
}

export async function generatePaymentsReport(filters: ReportFilters): Promise<ReportData> {
  try {
    const params = new URLSearchParams({
      startDate: filters.startDate,
      endDate: filters.endDate
    });
    
    if (filters.propertyId && filters.propertyId !== 'all') {
      params.append('propertyId', filters.propertyId);
    }

    const response = await request<any>(`/api/reports/payments?${params.toString()}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to generate payments report');
  } catch (error) {
    console.error('Error generating payments report:', error);
    throw error;
  }
}

export async function generateTenantsReport(filters: ReportFilters): Promise<ReportData> {
  try {
    const params = new URLSearchParams();
    
    if (filters.propertyId && filters.propertyId !== 'all') {
      params.append('propertyId', filters.propertyId);
    }

    const response = await request<any>(`/api/reports/tenants?${params.toString()}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to generate tenants report');
  } catch (error) {
    console.error('Error generating tenants report:', error);
    throw error;
  }
}

export async function generateOccupancyReport(filters: ReportFilters): Promise<ReportData> {
  try {
    const params = new URLSearchParams();
    
    if (filters.propertyId && filters.propertyId !== 'all') {
      params.append('propertyId', filters.propertyId);
    }

    const response = await request<any>(`/api/reports/occupancy?${params.toString()}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to generate occupancy report');
  } catch (error) {
    console.error('Error generating occupancy report:', error);
    throw error;
  }
}

// Export functions
export async function exportReportToCSV(reportType: string, data: any): Promise<Blob> {
  try {
    const response = await fetch(`/api/reports/export/${reportType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return await response.blob();
  } catch (error) {
    console.error('Error exporting report:', error);
    throw error;
  }
}

// Print function with proper styling and Rupee symbol
export function printReport(reportType: string, reportData: any, filters: ReportFilters, propertyName?: string) {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow pop-ups to print the report');
    return;
  }

  // Generate HTML content
  const htmlContent = generatePrintHTML(reportType, reportData, filters, propertyName);
  
  // Write to the new window
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = function() {
    printWindow.print();
    // Optional: close after printing
    // printWindow.onafterprint = function() { printWindow.close(); };
  };
}

function generatePrintHTML(reportType: string, reportData: any, filters: ReportFilters, propertyName?: string): string {
  const title = reportType.charAt(0).toUpperCase() + reportType.slice(1) + ' Report';
  const dateRange = `${filters.startDate} to ${filters.endDate}`;
  const property = propertyName || 'All Properties';
  const generatedAt = new Date().toLocaleString();
  
  let tableHTML = '';
  
  switch (reportType) {
    case 'revenue':
    case 'payments':
      tableHTML = generatePaymentsTableHTML(reportData.payments || []);
      break;
    case 'tenants':
      tableHTML = generateTenantsTableHTML(reportData.tenants || []);
      break;
    case 'occupancy':
      tableHTML = generateOccupancyTableHTML(reportData.rooms || []);
      break;
  }
  
  const summaryHTML = generateSummaryHTML(reportType, reportData.summary);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
        h1 { color: #2563eb; margin-bottom: 5px; }
        .meta { color: #666; font-size: 14px; margin: 5px 0; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .summary-card { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .summary-card h3 { margin: 0 0 10px 0; color: #64748b; font-size: 14px; }
        .summary-card .value { font-size: 24px; font-weight: bold; color: #0f172a; }
        .summary-card .sub-value { font-size: 14px; color: #64748b; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
        th { background: #f1f5f9; color: #475569; font-weight: 600; padding: 10px; text-align: left; }
        td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
        tr:hover { background: #f8fafc; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
        .badge-success { background: #dcfce7; color: #166534; }
        .badge-warning { background: #fef9c3; color: #854d0e; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        .badge-secondary { background: #f1f5f9; color: #475569; }
        .footer { margin-top: 30px; text-align: center; color: #94a3b8; font-size: 12px; }
        .rupee-symbol { font-family: 'Rupee Foradian', Arial, sans-serif; }
        @media print {
          body { margin: 0.5in; }
          .no-print { display: none; }
          th { background-color: #f1f5f9 !important; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <div class="meta">Property: ${property}</div>
        <div class="meta">Period: ${dateRange}</div>
        <div class="meta">Generated: ${generatedAt}</div>
      </div>
      
      ${summaryHTML}
      
      <h2 style="margin-top: 30px; font-size: 18px;">Detailed Data</h2>
      ${tableHTML}
      
      <div class="footer">
        <p>This report is system generated. For any queries, please contact support.</p>
      </div>
    </body>
    </html>
  `;
}

function generateSummaryHTML(reportType: string, summary: any): string {
  let cards = '';
  
  switch (reportType) {
    case 'revenue':
      cards = `
        <div class="summary-card">
          <h3>Total Revenue</h3>
          <div class="value">₹${(summary.totalRevenue || 0).toLocaleString('en-IN')}</div>
        </div>
        <div class="summary-card">
          <h3>Rent Revenue</h3>
          <div class="value">₹${(summary.rentRevenue || 0).toLocaleString('en-IN')}</div>
          <div class="sub-value">${summary.rentCount || 0} payments</div>
        </div>
        <div class="summary-card">
          <h3>Deposit Revenue</h3>
          <div class="value">₹${(summary.depositRevenue || 0).toLocaleString('en-IN')}</div>
          <div class="sub-value">${summary.depositCount || 0} payments</div>
        </div>
        <div class="summary-card">
          <h3>Addon Revenue</h3>
          <div class="value">₹${(summary.addonRevenue || 0).toLocaleString('en-IN')}</div>
          <div class="sub-value">${summary.addonCount || 0} payments</div>
        </div>
        <div class="summary-card">
          <h3>Total Payments</h3>
          <div class="value">${summary.paymentCount || 0}</div>
        </div>
      `;
      break;
      
    case 'payments':
      cards = `
        <div class="summary-card">
          <h3>Total Amount</h3>
          <div class="value">₹${(summary.totalAmount || 0).toLocaleString('en-IN')}</div>
        </div>
        <div class="summary-card">
          <h3>Completed</h3>
          <div class="value">${summary.completedPayments || 0}</div>
          <div class="sub-value">₹${(summary.completedAmount || 0).toLocaleString('en-IN')}</div>
        </div>
        <div class="summary-card">
          <h3>Pending</h3>
          <div class="value">${summary.pendingPayments || 0}</div>
          <div class="sub-value">₹${(summary.pendingAmount || 0).toLocaleString('en-IN')}</div>
        </div>
        <div class="summary-card">
          <h3>Collection Rate</h3>
          <div class="value">${((summary.completedAmount / (summary.totalAmount || 1)) * 100).toFixed(1)}%</div>
        </div>
      `;
      break;
      
    case 'tenants':
      cards = `
        <div class="summary-card">
          <h3>Total Tenants</h3>
          <div class="value">${summary.totalTenants || 0}</div>
        </div>
        <div class="summary-card">
          <h3>Active Tenants</h3>
          <div class="value">${summary.activeTenants || 0}</div>
        </div>
        <div class="summary-card">
          <h3>With Bookings</h3>
          <div class="value">${summary.withActiveBookings || 0}</div>
        </div>
        <div class="summary-card">
          <h3>Gender Split</h3>
          <div class="value">M: ${summary.maleCount || 0} / F: ${summary.femaleCount || 0}</div>
        </div>
        <div class="summary-card">
          <h3>New This Month</h3>
          <div class="value">${summary.newTenantsThisMonth || 0}</div>
        </div>
      `;
      break;
      
    case 'occupancy':
      cards = `
        <div class="summary-card">
          <h3>Total Rooms</h3>
          <div class="value">${summary.totalRooms || 0}</div>
        </div>
        <div class="summary-card">
          <h3>Occupied</h3>
          <div class="value">${summary.occupiedRooms || 0}</div>
        </div>
        <div class="summary-card">
          <h3>Vacant</h3>
          <div class="value">${summary.vacantRooms || 0}</div>
        </div>
        <div class="summary-card">
          <h3>Maintenance</h3>
          <div class="value">${summary.maintenanceRooms || 0}</div>
        </div>
        <div class="summary-card">
          <h3>Occupancy Rate</h3>
          <div class="value">${summary.occupancyRate || 0}%</div>
        </div>
      `;
      break;
  }
  
  return `<div class="summary-grid">${cards}</div>`;
}

function generatePaymentsTableHTML(payments: any[]): string {
  if (!payments || payments.length === 0) {
    return '<p>No payment data available</p>';
  }
  
  let rows = '';
  payments.slice(0, 50).forEach(p => { // Limit to 50 rows for print
    const statusClass = p.status === 'completed' ? 'badge-success' : 
                        p.status === 'pending' ? 'badge-warning' : 
                        p.status === 'failed' ? 'badge-danger' : 'badge-secondary';
    
    rows += `
      <tr>
        <td>${p.payment_number || p.id || '-'}</td>
        <td>${p.payment_date ? new Date(p.payment_date).toLocaleDateString() : '-'}</td>
        <td>${p.tenant_name || 'N/A'}</td>
        <td>${p.property_name || 'N/A'}</td>
        <td>${p.payment_type || '-'}</td>
        <td>₹${(p.amount || 0).toLocaleString('en-IN')}</td>
        <td>${p.payment_method || '-'}</td>
        <td><span class="badge ${statusClass}">${p.status || 'unknown'}</span></td>
      </tr>
    `;
  });
  
  if (payments.length > 50) {
    rows += `<tr><td colspan="8" style="text-align: center; font-style: italic;">... and ${payments.length - 50} more records</td></tr>`;
  }
  
  return `
    <table>
      <thead>
        <tr>
          <th>Payment #</th>
          <th>Date</th>
          <th>Tenant</th>
          <th>Property</th>
          <th>Type</th>
          <th>Amount (₹)</th>
          <th>Method</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function generateTenantsTableHTML(tenants: any[]): string {
  if (!tenants || tenants.length === 0) {
    return '<p>No tenant data available</p>';
  }
  
  let rows = '';
  tenants.slice(0, 50).forEach(t => {
    rows += `
      <tr>
        <td>${t.full_name || '-'}</td>
        <td>${t.email || '-'}</td>
        <td>${t.phone || '-'}</td>
        <td>${t.gender || 'N/A'}</td>
        <td>${t.occupation || 'N/A'}</td>
        <td>${t.city || 'N/A'}</td>
        <td><span class="badge ${t.is_active ? 'badge-success' : 'badge-danger'}">${t.is_active ? 'Active' : 'Inactive'}</span></td>
      </tr>
    `;
  });
  
  if (tenants.length > 50) {
    rows += `<tr><td colspan="7" style="text-align: center; font-style: italic;">... and ${tenants.length - 50} more records</td></tr>`;
  }
  
  return `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Gender</th>
          <th>Occupation</th>
          <th>City</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function generateOccupancyTableHTML(rooms: any[]): string {
  if (!rooms || rooms.length === 0) {
    return '<p>No room data available</p>';
  }
  
  let rows = '';
  rooms.slice(0, 50).forEach(r => {
    const statusClass = r.status === 'occupied' ? 'badge-success' : 
                        r.status === 'vacant' ? 'badge-warning' : 
                        r.status === 'maintenance' ? 'badge-danger' : 'badge-secondary';
    
    rows += `
      <tr>
        <td>${r.property_name || 'N/A'}</td>
        <td>${r.room_number || '-'}</td>
        <td>${r.room_type || '-'}</td>
        <td>${r.floor || 'N/A'}</td>
        <td>₹${(r.rent_amount || 0).toLocaleString('en-IN')}</td>
        <td><span class="badge ${statusClass}">${r.status || 'unknown'}</span></td>
        <td>${r.occupied_beds || 0} / ${r.total_bed || 0}</td>
      </tr>
    `;
  });
  
  if (rooms.length > 50) {
    rows += `<tr><td colspan="7" style="text-align: center; font-style: italic;">... and ${rooms.length - 50} more records</td></tr>`;
  }
  
  return `
    <table>
      <thead>
        <tr>
          <th>Property</th>
          <th>Room #</th>
          <th>Type</th>
          <th>Floor</th>
          <th>Rent (₹)</th>
          <th>Status</th>
          <th>Occupancy</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}