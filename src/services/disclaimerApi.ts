import { baseApi } from "@/services/baseApi";

import type {
  DisclaimerResponse,
  UpdateDisclaimerRequest,
} from "@/types/disclaimer";

export const disclaimerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDisclaimer: build.query<DisclaimerResponse, string>({
      query: (type) => ({ url: `/disclaimers/${type}`, method: "GET" }),
      providesTags: (_result, _error, arg) => [
        { type: "Disclaimers", id: arg },
      ],
    }),
    updateDisclaimer: build.mutation<
      DisclaimerResponse,
      { body: UpdateDisclaimerRequest }
    >({
      query: ({ body }) => ({
        url: `/disclaimers`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { body }) => [
        { type: "Disclaimers", id: body.type },
      ],
    }),
  }),
});

export const { useGetDisclaimerQuery, useUpdateDisclaimerMutation } =
  disclaimerApi;
