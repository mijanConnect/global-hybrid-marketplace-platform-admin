import { baseApi } from "@/services/baseApi";

import type { DashboardStatsResponse } from "@/types/dashboard";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardStats: build.query<DashboardStatsResponse, void>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const metricsRes = await fetchWithBQ(
          "/admin-dashboard/overview/metrics",
        );
        if (metricsRes.error) return { error: metricsRes.error as any };

        const ordersRes = await fetchWithBQ(
          "/admin-dashboard/overview/orders-trend",
        );
        if (ordersRes.error) return { error: ordersRes.error as any };

        const revenueRes = await fetchWithBQ(
          "/admin-dashboard/overview/revenue-trend",
        );
        if (revenueRes.error) return { error: revenueRes.error as any };

        const metricsData = (metricsRes.data as any).data;
        const ordersData = (ordersRes.data as any).data;
        const revenueData = (revenueRes.data as any).data;

        return {
          data: {
            totals: {
              users: metricsData.totalUsers,
              vendors: metricsData.totalVendors,
              orders: metricsData.totalOrders,
              revenue: metricsData.totalRevenue,
            },
            meta: {
              activeDeliveries: metricsData.activeDeliveries,
              pendingApprovals: metricsData.pendingApprovals,
              supportTickets: 0,
            },
            ordersTrend: ordersData.map((d: any) => ({
              date: d.day,
              orders: d.productOrders + d.serviceOrders,
            })),
            revenueTrend: revenueData.map((d: any) => ({
              date: d.day,
              revenue: d.revenue,
            })),
            pendingVendors: [],
            recentOrders: [],
            activeDeliveries: [],
          },
        };
      },
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
