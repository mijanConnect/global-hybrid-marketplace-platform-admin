import { baseApi } from "./baseApi";

export interface AnalyticsChartBase {
  date: string;
  label: string;
}

export interface UsersGrowthData extends AnalyticsChartBase {
  signups: number;
}

export interface OrdersChartData extends AnalyticsChartBase {
  productOrders: number;
  serviceOrders: number;
  orders: number;
}

export interface RevenueChartData extends AnalyticsChartBase {
  revenue: number;
}

export interface AnalyticsMetrics {
  revenue: { value: number; percentageChange: number };
  orders: { value: number; percentageChange: number };
  users: { value: number; percentageChange: number };
  activeVendors: { value: number; percentageChange: number };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsersGrowthChart: builder.query<
      ApiResponse<UsersGrowthData[]>,
      { startDate?: string; endDate?: string; role?: string; country?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.startDate) queryParams.append("startDate", params.startDate);
        if (params.endDate) queryParams.append("endDate", params.endDate);
        if (params.role && params.role !== "all")
          queryParams.append("role", params.role);
        if (params.country) queryParams.append("country", params.country);
        const qs = queryParams.toString();
        return `/admin-dashboard/analytics/users-growth-chart${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Analytics"],
    }),
    getOrdersChart: builder.query<
      ApiResponse<OrdersChartData[]>,
      { startDate?: string; endDate?: string; role?: string; country?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.startDate) queryParams.append("startDate", params.startDate);
        if (params.endDate) queryParams.append("endDate", params.endDate);
        if (params.role && params.role !== "all")
          queryParams.append("role", params.role);
        if (params.country) queryParams.append("country", params.country);
        const qs = queryParams.toString();
        return `/admin-dashboard/analytics/orders-chart${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Analytics"],
    }),
    getRevenueChart: builder.query<
      ApiResponse<RevenueChartData[]>,
      { startDate?: string; endDate?: string; role?: string; country?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.startDate) queryParams.append("startDate", params.startDate);
        if (params.endDate) queryParams.append("endDate", params.endDate);
        if (params.role && params.role !== "all")
          queryParams.append("role", params.role);
        if (params.country) queryParams.append("country", params.country);
        const qs = queryParams.toString();
        return `/admin-dashboard/analytics/revenue-chart${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Analytics"],
    }),
    getMetrics: builder.query<
      ApiResponse<AnalyticsMetrics>,
      { startDate?: string; endDate?: string; role?: string; country?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.startDate) queryParams.append("startDate", params.startDate);
        if (params.endDate) queryParams.append("endDate", params.endDate);
        if (params.role && params.role !== "all")
          queryParams.append("role", params.role);
        if (params.country) queryParams.append("country", params.country);
        const qs = queryParams.toString();
        return `/admin-dashboard/analytics/metrics${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Analytics"],
    }),
  }),
});

export const {
  useGetUsersGrowthChartQuery,
  useGetOrdersChartQuery,
  useGetRevenueChartQuery,
  useGetMetricsQuery,
} = analyticsApi;
