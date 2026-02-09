export type ComparisonMode = '1year' | '2year' | 'custom';
export type FinancialTab = 'all' | 'income' | 'expense' | 'profit';
export type ChartType = 'area' | 'line' | 'bar';
export type DateFilterType = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface MonthlySummary {
  income: number;
  expense: number;
  netProfit: number;
}

export interface DashboardStats {
  totalProperties: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  totalTenants: number;
  activeTenants: number;
  monthlyRevenue: number;
  totalUsers: number;
   activeUsers?: number;
  newUsers?: number;
   userGrowth?: number;
  revenueGrowth?: number;
  activeUsersGrowth?: number;
  newUsersGrowth?: number;
}

export interface FilterState {
  selectedYear: number | 'all';
  selectedMonth: string;
  selectedDate: Date | null;
  comparisonMode: ComparisonMode;
  selectedYear1: string;
  selectedYear2: string;
  firstMonth: string;
  firstYear: string;
  secondMonth: string;
  secondYear: string;
  occupancyDateFilter: DateFilterType;
  occupancySelectedDate: Date;
  financialTab: FinancialTab;
  chartType: ChartType;
  financialYear: number | 'all';
  financialMonth: string;
  selectedType: string;
}

export interface ApiEndpoints {
  properties: string;
  rooms: string;
  tenants: string;
  payments: string;
}