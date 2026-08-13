import { baseApi } from "./baseApi";

export type Category = {
  _id: string;
  name: string;
  slug: string;
  image: string;
  type: string; // 'product' | 'service'
  parent: string | null;
  isFeatured: boolean;
  status: string; // 'active' | 'inactive'
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type CategoriesResponse = {
  success: boolean;
  message: string;
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPage: number;
  };
  data: Category[];
};

export type GetCategoriesParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  type?: string;
  isFeatured?: boolean;
  status?: string;
};

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<CategoriesResponse, GetCategoriesParams>({
      query: (params) => ({
        url: "/categories",
        method: "GET",
        params,
      }),
      providesTags: ["Categories" as any], // Use 'as any' if 'Categories' isn't in tagTypes yet
    }),
    createCategory: build.mutation<Category, FormData>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Categories" as any],
    }),
    updateCategory: build.mutation<Category, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Categories" as any],
    }),
    deleteCategory: build.mutation<void, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories" as any],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
