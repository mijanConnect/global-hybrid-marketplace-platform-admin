import { baseApi } from "@/services/baseApi";
import type {
  ServiceProvidersStatsResponse,
  ServiceProvidersResponse,
  UpdateServiceProviderStatusRequest,
  UpdateServiceProviderStatusResponse,
} from "@/types/serviceProvider";

export const serviceProvidersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getServiceProvidersStats: build.query<ServiceProvidersStatsResponse, void>({
      query: () => ({
        url: "/admin-dashboard/service-providers/stats",
        method: "GET",
      }),
      providesTags: ["ServiceProviders"],
    }),
    getServiceProviders: build.query<
      ServiceProvidersResponse,
      { page?: number; limit?: number; search?: string } | void
    >({
      query: (params) => {
        let url = "/admin-dashboard/service-providers/";
        if (params) {
          const searchParams = new URLSearchParams();
          if (params.page) searchParams.append("page", params.page.toString());
          if (params.limit)
            searchParams.append("limit", params.limit.toString());
          if (params.search) searchParams.append("search", params.search);
          const qs = searchParams.toString();
          if (qs) url += `?${qs}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["ServiceProviders"],
    }),
    updateServiceProviderStatus: build.mutation<
      UpdateServiceProviderStatusResponse,
      UpdateServiceProviderStatusRequest
    >({
      query: ({ id, status }) => ({
        url: `/admin-dashboard/service-providers/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["ServiceProviders"],
    }),
  }),
});

export const {
  useGetServiceProvidersStatsQuery,
  useGetServiceProvidersQuery,
  useUpdateServiceProviderStatusMutation,
} = serviceProvidersApi;
