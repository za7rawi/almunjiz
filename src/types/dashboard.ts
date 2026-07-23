export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalServices: number;
  pendingOrders: number;
  completedOrders: number;
  activeServices: number;
  totalEmployees: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  averageOrderValue: number;
  customerSatisfaction: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}
