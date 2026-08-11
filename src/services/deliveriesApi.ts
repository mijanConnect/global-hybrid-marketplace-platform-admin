import { baseApi } from "./baseApi";
import type {
  DeliveriesResponse,
  DeliveryDetailsResponse,
  DeliveryStatsResponse,
  DeliveryStatus
} from "@/types/delivery";

export interface DeliveriesQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  driver?: string;
  searchTerm?: string;
}

export const deliveriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDeliveriesStats: build.query<DeliveryStatsResponse, void>({
      query: () => "/admin-dashboard/deliveries/stats",
      providesTags: ["Deliveries"],
    }),
    getDeliveries: build.query<DeliveriesResponse, DeliveriesQueryParams | void>({
      query: (params) => {
        if (!params) return "/admin-dashboard/deliveries";
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.status && params.status !== "all") queryParams.append("status", params.status);
        if (params.type && params.type !== "all") queryParams.append("type", params.type);
        if (params.driver && params.driver !== "all") queryParams.append("driver", params.driver);
        if (params.searchTerm) queryParams.append("searchTerm", params.searchTerm);
        return `/admin-dashboard/deliveries?${queryParams.toString()}`;
      },
      providesTags: ["Deliveries"],
    }),
    getDeliveryById: build.query<DeliveryDetailsResponse, string>({
      query: (id) => `/admin-dashboard/deliveries/${id}`,
      providesTags: (result, error, arg) => [{ type: "Deliveries", id: arg }],
    }),
    updateDeliveryStatus: build.mutation<any, { id: string; status: DeliveryStatus }>({
      query: ({ id, status }) => ({
        url: `/admin-dashboard/deliveries/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        "Deliveries",
        { type: "Deliveries", id },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDeliveriesStatsQuery,
  useGetDeliveriesQuery,
  useGetDeliveryByIdQuery,
  useUpdateDeliveryStatusMutation,
} = deliveriesApi;
