import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OtpVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || "";
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!otp) {
        setError("Please enter OTP");
        return;
      }

      if (otp.length !== 6) {
        setError("OTP must be 6 digits");
        return;
      }

      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Navigate to dashboard or login
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
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
            disabled={isLoading}
            className="text-center text-2xl tracking-widest"
            required
          />
          <p className="mt-1 text-xs text-gray-500">6-digit code</p>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Verifying..." : "Verify OTP"}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
        <a href="#" className="text-primary font-medium">
          Resend OTP
        </a>
      </div>

      <div className="text-center text-sm">
        <button
          onClick={() => navigate("/register")}
          className="text-primary font-medium"
        >
          Back to registration
        </button>
      </div>
    </div>
  );
}
