import { baseApi } from "./baseApi";
import type {
  WithdrawRequestsResponse,
  WithdrawRequestStatus,
} from "@/types/withdrawRequest";

export interface WithdrawRequestsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  searchTerm?: string;
}

export const withdrawRequestsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getWithdrawRequests: build.query<WithdrawRequestsResponse, WithdrawRequestsQueryParams | void>({
      query: (params) => {
        if (!params) return "/withdraw-requests";
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.status && params.status !== "all") queryParams.append("status", params.status);
        if (params.searchTerm) queryParams.append("searchTerm", params.searchTerm);
        return `/withdraw-requests?${queryParams.toString()}`;
      },
      providesTags: ["WithdrawRequests"],
    }),
    updateWithdrawRequestStatus: build.mutation<any, { id: string; status: WithdrawRequestStatus }>({
      query: ({ id, status }) => ({
        url: `/withdraw-requests/${id}/approve-reject`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["WithdrawRequests"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWithdrawRequestsQuery,
  useUpdateWithdrawRequestStatusMutation,
} = withdrawRequestsApi;
