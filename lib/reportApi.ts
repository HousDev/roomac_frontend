import { request } from "@/lib/api";

// Types
export interface ReportFilters {
  reportType: 'revenue' | 'payments' | 'tenants' | 'occupancy' | 'expenses' | 'requests';
  startDate: string;
  endDate: string;
  propertyId: string | 'all';
  status?: string;
  categoryId?: string;
  requestType?: string;
  groupBy?: 'day' | 'month';
}

export interface DashboardStats {
  // Property Stats
  totalProperties: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  
  // Tenant Stats
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  
  // Revenue Stats
  totalRevenue: number;
  rentRevenue: number;
  depositRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  
  // Payment Stats
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  rejectedPayments: number;
  completedAmount: number;
  pendingAmount: number;
  collectionRate: number;
  
  // Request Stats
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  resolvedRequests: number;
  complaints: number;
  maintenanceRequests: number;
  vacateRequests: number;
  changeBedRequests: number;
}

export interface ReportData {
  payments?: any[];
  tenants?: any[];
  rooms?: any[];
  expenses?: any[];
  requests?: any[];
  summary: any;
  meta: {
    generatedAt: string;
    dateRange: { start: string; end: string };
    property?: { id: string; name: string };
    groupBy?: string;
  };
}

export interface FilterOptions {
  properties: PropertyOption[];
  expenseCategories: { id: number; name: string }[];
  requestTypes: string[];
  paymentStatuses: string[];
  requestStatuses: string[];
  expenseStatuses: string[];
  roomStatuses: string[];
  dateRanges: { value: string; label: string }[];
}

export interface PropertyOption {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
}

let propertiesCache: PropertyOption[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export async function fetchProperties(forceRefresh = false): Promise<PropertyOption[]> {
  const now = Date.now();
  
  if (!forceRefresh && propertiesCache && (now - lastFetchTime) < CACHE_DURATION) {
    return propertiesCache;
  }

  try {
    const response = await request<any>('/api/properties?is_active=true&pageSize=1000');
    
    if (response.success && response.data) {
      const propertiesData = response.data.data || response.data;
      
      propertiesCache = Array.isArray(propertiesData) 
        ? propertiesData.map((p: any) => ({
            id: p.id.toString(),
            name: p.name,
            address: p.address || '',
            city: p.city_id || p.city || '',
            state: p.state || ''
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
    
    return getDefaultDashboardStats();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return getDefaultDashboardStats();
  }
}

function getDefaultDashboardStats(): DashboardStats {
  return {
    totalProperties: 0,
    totalRooms: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    occupancyRate: 0,
    totalTenants: 0,
    activeTenants: 0,
    inactiveTenants: 0,
    totalRevenue: 0,
    rentRevenue: 0,
    depositRevenue: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    totalPayments: 0,
    completedPayments: 0,
    pendingPayments: 0,
    rejectedPayments: 0,
    completedAmount: 0,
    pendingAmount: 0,
    collectionRate: 0,
    totalRequests: 0,
    pendingRequests: 0,
    inProgressRequests: 0,
    resolvedRequests: 0,
    complaints: 0,
    maintenanceRequests: 0,
    vacateRequests: 0,
    changeBedRequests: 0
  };
}

export async function generateRevenueReport(filters: ReportFilters): Promise<ReportData> {
  try {
    const params = new URLSearchParams({
      startDate: filters.startDate,
      endDate: filters.endDate,
      groupBy: filters.groupBy || 'day'
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
    if (filters.status) {
      params.append('status', filters.status);
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
    if (filters.status) {
      params.append('status', filters.status);
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
    if (filters.status) {
      params.append('status', filters.status);
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

export async function generateExpenseReport(filters: ReportFilters): Promise<ReportData> {
  try {
    const params = new URLSearchParams({
      startDate: filters.startDate,
      endDate: filters.endDate
    });
    
    if (filters.propertyId && filters.propertyId !== 'all') {
      params.append('propertyId', filters.propertyId);
    }
    if (filters.categoryId) {
      params.append('categoryId', filters.categoryId);
    }

    const response = await request<any>(`/api/reports/expenses?${params.toString()}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to generate expense report');
  } catch (error) {
    console.error('Error generating expense report:', error);
    throw error;
  }
}

export async function generateRequestReport(filters: ReportFilters): Promise<ReportData> {
  try {
    const params = new URLSearchParams({
      startDate: filters.startDate,
      endDate: filters.endDate
    });
    
    if (filters.requestType && filters.requestType !== 'all') {
      params.append('requestType', filters.requestType);
    }
    if (filters.status) {
      params.append('status', filters.status);
    }

    const response = await request<any>(`/api/reports/requests?${params.toString()}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to generate request report');
  } catch (error) {
    console.error('Error generating request report:', error);
    throw error;
  }
}

export async function getReportFilters(): Promise<FilterOptions> {
  try {
    const response = await request<any>('/api/reports/filters');
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get report filters');
  } catch (error) {
    console.error('Error getting report filters:', error);
    throw error;
  }
}

export async function exportReportToExcel(reportType: string, data: any, filters: any): Promise<Blob> {
  try {
    const response = await fetch(`/api/reports/export/${reportType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data, filters }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Export failed');
    }

    return await response.blob();
  } catch (error) {
    console.error('Error exporting report:', error);
    throw error;
  }
}

export function printReport(reportType: string, reportData: any, filters: ReportFilters, propertyName?: string) {
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow pop-ups to print the report');
    return;
  }

  const htmlContent = generatePrintHTML(reportType, reportData, filters, propertyName);
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  printWindow.onload = function() {
    printWindow.print();
  };
}

function generatePrintHTML(reportType: string, reportData: any, filters: ReportFilters, propertyName?: string): string {
  const title = getReportTitle(reportType);
  const dateRange = `${filters.startDate} to ${filters.endDate}`;
  const property = propertyName || 'All Properties';
  const generatedAt = new Date().toLocaleString();
  
  let tableHTML = '';
  let summaryHTML = '';
  
  switch (reportType) {
    case 'revenue':
      tableHTML = generateRevenueTableHTML(reportData.payments || []);
      summaryHTML = generateRevenueSummaryHTML(reportData.summary);
      break;
    case 'payments':
      tableHTML = generatePaymentsTableHTML(reportData.payments || []);
      summaryHTML = generatePaymentsSummaryHTML(reportData.summary);
      break;
    case 'tenants':
      tableHTML = generateTenantsTableHTML(reportData.tenants || []);
      summaryHTML = generateTenantsSummaryHTML(reportData.summary);
      break;
    case 'occupancy':
      tableHTML = generateOccupancyTableHTML(reportData.rooms || []);
      summaryHTML = generateOccupancySummaryHTML(reportData.summary);
      break;
    case 'expenses':
      tableHTML = generateExpensesTableHTML(reportData.expenses || []);
      summaryHTML = generateExpensesSummaryHTML(reportData.summary);
      break;
    case 'requests':
      tableHTML = generateRequestsTableHTML(reportData.requests || []);
      summaryHTML = generateRequestsSummaryHTML(reportData.summary);
      break;
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .report-container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header .meta { font-size: 12px; opacity: 0.8; margin-top: 5px; }
        .summary-section { padding: 20px 30px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .summary-card { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .summary-card h3 { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .summary-card .value { font-size: 24px; font-weight: bold; color: #0f172a; }
        .summary-card .sub-value { font-size: 12px; color: #64748b; margin-top: 5px; }
        .data-section { padding: 20px 30px; }
        .data-section h2 { font-size: 18px; margin-bottom: 15px; color: #1e293b; border-left: 4px solid #3b82f6; padding-left: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #f1f5f9; color: #475569; font-weight: 600; padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
        tr:hover { background: #f8fafc; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
        .badge-success { background: #dcfce7; color: #166534; }
        .badge-warning { background: #fef9c3; color: #854d0e; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        .badge-info { background: #dbeafe; color: #1e40af; }
        .badge-secondary { background: #f1f5f9; color: #475569; }
        .footer { padding: 20px 30px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
        @media print {
          body { background: white; margin: 0; }
          .report-container { box-shadow: none; border-radius: 0; }
          .header { background: #1e3c72; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <div class="header">
          <h1>${title}</h1>
          <div class="meta">Property: ${property}</div>
          <div class="meta">Period: ${dateRange}</div>
          <div class="meta">Generated: ${generatedAt}</div>
        </div>
        
        <div class="summary-section">
          ${summaryHTML}
        </div>
        
        <div class="data-section">
          <h2>Detailed Data</h2>
          ${tableHTML}
        </div>
        
        <div class="footer">
          <p>This report is system generated from Roomac Management System</p>
          <p>For any queries, please contact support@roomac.in</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getReportTitle(reportType: string): string {
  const titles: Record<string, string> = {
    revenue: 'Revenue Report',
    payments: 'Payments Report',
    tenants: 'Tenants Report',
    occupancy: 'Occupancy Report',
    expenses: 'Expenses Report',
    requests: 'Requests Report'
  };
  return titles[reportType] || 'Report';
}

function generateRevenueSummaryHTML(summary: any): string {
  return `
    <div class="summary-grid">
      <div class="summary-card">
        <h3>Total Revenue</h3>
        <div class="value">₹${(summary.totalRevenue || 0).toLocaleString('en-IN')}</div>
        <div class="sub-value">${summary.totalTransactions || 0} transactions</div>
      </div>
      <div class="summary-card">
        <h3>Rent Revenue</h3>
        <div class="value">₹${(summary.revenueByType?.rent || 0).toLocaleString('en-IN')}</div>
      </div>
      <div class="summary-card">
        <h3>Security Deposit</h3>
        <div class="value">₹${(summary.revenueByType?.security_deposit || 0).toLocaleString('en-IN')}</div>
      </div>
      <div class="summary-card">
        <h3>Average Transaction</h3>
        <div class="value">₹${Math.round(summary.avgTransactionValue || 0).toLocaleString('en-IN')}</div>
      </div>
    </div>
  `;
}

function generatePaymentsSummaryHTML(summary: any): string {
  return `
    <div class="summary-grid">
      <div class="summary-card">
        <h3>Total Amount</h3>
        <div class="value">₹${(summary.totalAmount || 0).toLocaleString('en-IN')}</div>
      </div>
      <div class="summary-card">
        <h3>Collection Rate</h3>
        <div class="value">${summary.collectionRate || 0}%</div>
      </div>
      <div class="summary-card">
        <h3>Completed</h3>
        <div class="value">${summary.completedTransactions || 0}</div>
        <div class="sub-value">₹${(summary.completedAmount || 0).toLocaleString('en-IN')}</div>
      </div>
      <div class="summary-card">
        <h3>Pending</h3>
        <div class="value">${summary.pendingTransactions || 0}</div>
        <div class="sub-value">₹${(summary.pendingAmount || 0).toLocaleString('en-IN')}</div>
      </div>
    </div>
  `;
}

function generateTenantsSummaryHTML(summary: any): string {
  return `
    <div class="summary-grid">
      <div class="summary-card">
        <h3>Total Tenants</h3>
        <div class="value">${summary.totalTenants || 0}</div>
      </div>
      <div class="summary-card">
        <h3>Active</h3>
        <div class="value">${summary.activeTenants || 0}</div>
      </div>
      <div class="summary-card">
        <h3>With Bookings</h3>
        <div class="value">${summary.tenantsWithAssignments || 0}</div>
      </div>
      <div class="summary-card">
        <h3>New This Month</h3>
        <div class="value">${summary.newTenantsThisMonth || 0}</div>
      </div>
      <div class="summary-card">
        <h3>Total Paid</h3>
        <div class="value">₹${(summary.totalPaid || 0).toLocaleString('en-IN')}</div>
      </div>
    </div>
  `;
}

function generateOccupancySummaryHTML(summary: any): string {
  return `
    <div class="summary-grid">
      <div class="summary-card">
        <h3>Occupancy Rate</h3>
        <div class="value">${summary.occupancyRate || 0}%</div>
      </div>
      <div class="summary-card">
        <h3>Total Beds</h3>
        <div class="value">${summary.totalBeds || 0}</div>
      </div>
      <div class="summary-card">
        <h3>Occupied Beds</h3>
        <div class="value">${summary.occupiedBeds || 0}</div>
      </div>
      <div class="summary-card">
        <h3>Total Rooms</h3>
        <div class="value">${summary.totalRooms || 0}</div>
      </div>
    </div>
  `;
}

function generateExpensesSummaryHTML(summary: any): string {
  return `
    <div class="summary-grid">
      <div class="summary-card">
        <h3>Total Expenses</h3>
        <div class="value">₹${(summary.totalAmount || 0).toLocaleString('en-IN')}</div>
      </div>
      <div class="summary-card">
        <h3>Total Paid</h3>
        <div class="value">₹${(summary.totalPaid || 0).toLocaleString('en-IN')}</div>
      </div>
      <div class="summary-card">
        <h3>Pending Balance</h3>
        <div class="value">₹${(summary.totalBalance || 0).toLocaleString('en-IN')}</div>
      </div>
      <div class="summary-card">
        <h3>Transactions</h3>
        <div class="value">${summary.totalTransactions || 0}</div>
      </div>
    </div>
  `;
}

function generateRequestsSummaryHTML(summary: any): string {
  return `
    <div class="summary-grid">
      <div class="summary-card">
        <h3>Total Requests</h3>
        <div class="value">${summary.totalRequests || 0}</div>
      </div>
      <div class="summary-card">
        <h3>Pending</h3>
        <div class="value">${summary.pendingCount || 0}</div>
      </div>
      <div class="summary-card">
        <h3>In Progress</h3>
        <div class="value">${summary.inProgressCount || 0}</div>
      </div>
      <div class="summary-card">
        <h3>Resolved</h3>
        <div class="value">${summary.resolvedCount || 0}</div>
      </div>
    </div>
  `;
}

function generateRevenueTableHTML(payments: any[]): string {
  if (!payments || payments.length === 0) {
    return '<p>No payment data available</p>';
  }
  
  let rows = '';
  payments.slice(0, 50).forEach(p => {
    rows += `
      <tr>
        <td>${p.payment_date?.split('T')[0] || '-'}</td>
        <td>${p.tenant_name || 'N/A'}</td>
        <td>${p.property_name || 'N/A'}</td>
        <td>${p.payment_type || '-'}</td>
        <td class="text-right">₹${(p.amount || 0).toLocaleString('en-IN')}</td>
        <td>${p.payment_mode || '-'}</td>
        <td><span class="badge badge-success">${p.status || 'N/A'}</span></td>
      </tr>
    `;
  });
  
  return `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Tenant</th>
          <th>Property</th>
          <th>Type</th>
          <th class="text-right">Amount (₹)</th>
          <th>Mode</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function generatePaymentsTableHTML(payments: any[]): string {
  if (!payments || payments.length === 0) {
    return '<p>No payment data available</p>';
  }
  
  let rows = '';
  payments.slice(0, 50).forEach(p => {
    const statusClass = p.status === 'approved' || p.status === 'paid' ? 'badge-success' : 
                        p.status === 'pending' ? 'badge-warning' : 'badge-danger';
    rows += `
      <tr>
        <td>${p.payment_date?.split('T')[0] || '-'}</td>
        <td>${p.tenant_name || 'N/A'}</td>
        <td>${p.property_name || 'N/A'}</td>
        <td class="text-right">₹${(p.amount || 0).toLocaleString('en-IN')}</td>
        <td>${p.payment_mode || '-'}</td>
        <td><span class="badge ${statusClass}">${p.status || 'N/A'}</span></td>
        <td>${p.transaction_id || '-'}</td>
      </tr>
    `;
  });
  
  return `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Tenant</th>
          <th>Property</th>
          <th class="text-right">Amount (₹)</th>
          <th>Method</th>
          <th>Status</th>
          <th>Transaction ID</th>
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
        <td>${t.occupation_category || 'N/A'}</td>
        <td>${t.property_name || 'N/A'}</td>
        <td>${t.room_number || 'N/A'}</td>
        <td><span class="badge ${t.is_active ? 'badge-success' : 'badge-danger'}">${t.is_active ? 'Active' : 'Inactive'}</span></td>
      </tr>
    `;
  });
  
  return `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Gender</th>
          <th>Occupation</th>
          <th>Property</th>
          <th>Room</th>
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
    const statusClass = r.status === 'full' || r.status === 'occupied' ? 'badge-success' : 
                        r.status === 'partial' ? 'badge-warning' : 'badge-secondary';
    rows += `
      <tr>
        <td>${r.property_name || 'N/A'}</td>
        <td>${r.room_number || '-'}</td>
        <td>${r.room_type || 'Standard'}</td>
        <td>${r.floor || 'N/A'}</td>
        <td class="text-right">₹${(r.rent_per_bed || 0).toLocaleString('en-IN')}</td>
        <td>${r.occupied_beds || 0} / ${r.total_bed || 0}</td>
        <td><span class="badge ${statusClass}">${r.status || 'N/A'}</span></td>
      </tr>
    `;
  });
  
  return `
    <table>
      <thead>
        <tr>
          <th>Property</th>
          <th>Room #</th>
          <th>Type</th>
          <th>Floor</th>
          <th class="text-right">Rent (₹)</th>
          <th>Occupancy</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function generateExpensesTableHTML(expenses: any[]): string {
  if (!expenses || expenses.length === 0) {
    return '<p>No expense data available</p>';
  }
  
  let rows = '';
  expenses.slice(0, 50).forEach(e => {
    const statusClass = e.status === 'Paid' ? 'badge-success' : 
                        e.status === 'Partial' ? 'badge-warning' : 'badge-danger';
    rows += `
      <tr>
        <td>${e.expense_date?.split('T')[0] || '-'}</td>
        <td>${e.property_name || 'N/A'}</td>
        <td>${e.category_name || 'N/A'}</td>
        <td>${e.vendor_name || 'N/A'}</td>
        <td class="text-right">₹${(e.total_amount || 0).toLocaleString('en-IN')}</td>
        <td class="text-right">₹${(e.total_paid || 0).toLocaleString('en-IN')}</td>
        <td><span class="badge ${statusClass}">${e.status || 'N/A'}</span></td>
      </tr>
    `;
  });
  
  return `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Property</th>
          <th>Category</th>
          <th>Vendor</th>
          <th class="text-right">Amount (₹)</th>
          <th class="text-right">Paid (₹)</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function generateRequestsTableHTML(requests: any[]): string {
  if (!requests || requests.length === 0) {
    return '<p>No request data available</p>';
  }
  
  let rows = '';
  requests.slice(0, 50).forEach(r => {
    const statusClass = r.status === 'resolved' ? 'badge-success' : 
                        r.status === 'in_progress' ? 'badge-warning' : 'badge-secondary';
    rows += `
      <tr>
        <td>${r.created_at?.split('T')[0] || '-'}</td>
        <td>${r.tenant_name || 'N/A'}</td>
        <td>${r.request_type || '-'}</td>
        <td>${r.title || '-'}</td>
        <td><span class="badge ${statusClass}">${r.status || 'N/A'}</span></td>
        <td><span class="badge badge-info">${r.priority || 'medium'}</span></td>
      </tr>
    `;
  });
  
  return `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Tenant</th>
          <th>Type</th>
          <th>Title</th>
          <th>Status</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}