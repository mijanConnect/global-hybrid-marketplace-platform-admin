import { baseApi } from "@/services/baseApi";

export type VendorStatus =
  | "active"
  | "inactive"
  | "pending"
  | "blocked"
  | "rejected"
  | "suspended";

export type Vendor = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  status: string;
  createdAt: string;
  totalOrders: number;
  businessName: string;
  ownerName: string;
  country: string;
  earnings: number;
};

export type VendorsListResponse = {
  success: boolean;
  message: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: Vendor[];
};

export type VendorStatsResponse = {
  success: boolean;
  message: string;
  data: {
    totalVendors: number;
    activeVendors: number;
    inactiveVendors: number;
  };
};

export type GetVendorsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export const vendorsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getVendors: build.query<VendorsListResponse, GetVendorsParams>({
      query: (params) => ({
        url: "/admin-dashboard/vendors",
        method: "GET",
        params,
      }),
      providesTags: ["Vendors"],
    }),
    getVendorStats: build.query<VendorStatsResponse, void>({
      query: () => ({ url: "/admin-dashboard/vendors/stats", method: "GET" }),
      providesTags: ["Vendors"],
    }),
    // Kept getVendorDetails for potential future use or if they provide it later
    getVendorDetails: build.query<any, string>({
      query: (id) => ({ url: `/admin-dashboard/vendors/${id}`, method: "GET" }),
      providesTags: ["Vendors"],
    }),
    updateVendorStatus: build.mutation<void, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin-dashboard/vendors/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Vendors"],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useGetVendorStatsQuery,
  useGetVendorDetailsQuery,
  useUpdateVendorStatusMutation,
} = vendorsApi;
