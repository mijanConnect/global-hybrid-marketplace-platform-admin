import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVerifyEmailMutation, useResendOtpMutation } from "@/services/authApi";

export default function OtpVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!otp) {
        setError("Please enter OTP");
        return;
      }

      if (otp.length !== 6) {
        setError("OTP must be 6 digits");
        return;
      }
      
      const result = await verifyEmail({ email, oneTimeCode: parseInt(otp, 10) }).unwrap();
      setSuccess(result.message || "OTP verified successfully");
      
      setTimeout(() => {
        navigate("/update-password");
      }, 1000);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "Invalid OTP");
    }
  };

  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!email) {
      setError("Email address is missing");
      return;
    }
    
    try {
      const result = await resendOtp({ email }).unwrap();
      setSuccess(result.message || "OTP resent successfully");
      setCountdown(60); // Reset countdown
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Verify OTP</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter the code sent to <span className="font-medium">{email}</span>
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="otp"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            OTP Code
          </label>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            placeholder="000000"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            disabled={isVerifying}
            className="text-center text-2xl tracking-widest"
            required
          />
          <p className="mt-1 text-xs text-gray-500">6-digit code</p>
        </div>

        <Button type="submit" disabled={isVerifying} className="w-full">
          {isVerifying ? "Verifying..." : "Verify OTP"}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
        <button 
          onClick={handleResend}
          disabled={isResending || countdown > 0}
          className="text-primary font-medium hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResending ? "Resending..." : countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
        </button>
      </div>

      <div className="text-center text-sm">
        <button
          onClick={() => navigate("/login")}
          className="text-primary font-medium hover:text-primary/80"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
