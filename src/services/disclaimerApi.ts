import { baseApi } from "@/services/baseApi";

export type DisclaimerResponse = {
  type: string;
  content: string;
  version?: string;
};

export const disclaimerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDisclaimer: build.query<DisclaimerResponse, string>({
      query: (type) => ({ url: `/disclaimers/${type}`, method: "GET" }),
      providesTags: (_result, _error, arg) => [
        { type: "Disclaimers" as any, id: arg },
      ],
    }),
    updateDisclaimer: build.mutation<
      DisclaimerResponse,
      { type: string; body: Partial<DisclaimerResponse> }
    >({
      query: ({ body }) => ({
        url: `/disclaimers`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { type }) => [
        { type: "Disclaimers" as any, id: type },
      ],
    }),
  }),
});

export const { useGetDisclaimerQuery, useUpdateDisclaimerMutation } =
  disclaimerApi;
