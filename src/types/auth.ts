export type LoginRequest = { email: string; password: string };
export type LoginResponse = {
  success: boolean;
  message: string;
  data: { accessToken: string; role: string };
};

export type ForgotPasswordRequest = { email: string };
export type VerifyEmailRequest = { email: string; oneTimeCode: number };
export type ResendOtpRequest = { email: string };
export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type AuthSuccessResponse = {
  success: boolean;
  message: string;
};
