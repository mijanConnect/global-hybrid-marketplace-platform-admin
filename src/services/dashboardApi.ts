import { baseApi } from "@/services/baseApi";

import type { DashboardStatsResponse } from "@/types/dashboard";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardStats: build.query<DashboardStatsResponse, void>({
      query: () => ({ url: "/admin/dashboard/stats", method: "GET" }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
