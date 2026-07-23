import { baseApi } from "@/services/baseApi";
import type {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  VerifyEmailRequest,
  ResendOtpRequest,
  ChangePasswordRequest,
  AuthSuccessResponse,
} from "@/types/auth";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    forgotPassword: build.mutation<AuthSuccessResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: "/auth/forget-password",
        method: "POST",
        body: data,
      }),
    }),
    verifyEmail: build.mutation<AuthSuccessResponse, VerifyEmailRequest>({
      query: (data) => ({
        url: "/auth/verify-email",
        method: "POST",
        body: data,
      }),
    }),
    resendOtp: build.mutation<AuthSuccessResponse, ResendOtpRequest>({
      query: (data) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body: data,
      }),
    }),
    changePassword: build.mutation<AuthSuccessResponse, ChangePasswordRequest>({
      query: (data) => ({
        url: "/auth/change-password",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyEmailMutation,
  useResendOtpMutation,
  useChangePasswordMutation,
} = authApi;
