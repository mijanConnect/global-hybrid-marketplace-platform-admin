import { baseApi } from "./baseApi";
import type { HeroSectionsResponse } from "@/types/hero";

export const heroApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getHeroSections: build.query<HeroSectionsResponse, void>({
      query: () => "/hero-section/",
      providesTags: ["Hero"],
    }),
    createHeroSection: build.mutation<any, FormData>({
      query: (formData) => ({
        url: "/hero-section/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Hero"],
    }),
    updateHeroSection: build.mutation<any, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/hero-section/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Hero"],
    }),
    deleteHeroSection: build.mutation<any, string>({
      query: (id) => ({
        url: `/hero-section/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Hero"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetHeroSectionsQuery,
  useCreateHeroSectionMutation,
  useUpdateHeroSectionMutation,
  useDeleteHeroSectionMutation,
} = heroApi;
