import { baseApi } from "@/services/baseApi";
import type {
  CustomersListResponse,
  GetCustomersParams,
  CustomerDetailsResponse,
} from "@/types/customer";

export const customersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCustomers: build.query<CustomersListResponse, GetCustomersParams>({
      query: (params) => ({
        url: "/admin-dashboard/customers",
        method: "GET",
        params,
      }),
      providesTags: ["Users"],
    }),
    getCustomerDetails: build.query<CustomerDetailsResponse, string>({
      query: (id) => ({
        url: `/admin-dashboard/customers/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Users", id }],
    }),
    updateCustomerStatus: build.mutation<void, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin-dashboard/customers/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerDetailsQuery,
  useUpdateCustomerStatusMutation,
} = customersApi;
