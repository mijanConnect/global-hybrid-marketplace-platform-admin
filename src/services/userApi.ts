import { baseApi } from "@/services/baseApi";

export type UserRole = "customer" | "vendor" | "driver";
export type UserStatus = "active" | "blocked";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  country: string;
  status: UserStatus;
};

export type UsersListResponse = {
  items: UserRow[];
  page: number;
  pageSize: number;
  total: number;
};

export type GetUsersParams = {
  q?: string;
  role?: UserRole | "all";
  status?: UserStatus | "all";
  page?: number;
  pageSize?: number;
};

export type UserProfileResponse = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    profileImage: string;
    coverImage: string;
    about: string;
    address: string;
    status: string;
    isVerified: boolean;
  };
};

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<UsersListResponse, GetUsersParams>({
      query: (params) => ({ url: "/admin/users", method: "GET", params }),
      providesTags: ["Users"],
    }),
    blockUser: build.mutation<void, { id: string; block: boolean }>({
      query: ({ id, block }) => ({
        url: `/admin/users/${id}/${block ? "block" : "unblock"}`,
        method: "POST",
      }),
      invalidatesTags: ["Users", "Dashboard"],
    }),
    changeUserRole: build.mutation<void, { id: string; role: UserRole }>({
      query: ({ id, role }) => ({
        url: `/admin/users/${id}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["Users"],
    }),
    getProfile: build.query<UserProfileResponse, void>({
      query: () => ({ url: "/users/profile", method: "GET" }),
      providesTags: ["Profile" as any],
    }),
    updateProfile: build.mutation<
      { success: boolean; message: string; data: any },
      FormData
    >({
      query: (body) => ({
        url: "/users/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Profile" as any],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useBlockUserMutation,
  useChangeUserRoleMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = usersApi;
