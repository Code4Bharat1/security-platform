"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from 'react-hot-toast';
import { useAuth } from "@/context/AuthContext";
import GoogleLoginButton from "@/components/Auth/GoogleLoginButton.jsx";

export default function GainAccess() {
  const { setToken, setUser } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // Forgot password wizard state variables
  const [flowMode, setFlowMode] = useState("login"); // 'login', 'forgot_email', 'forgot_otp', 'forgot_reset'
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const checkRedirect = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCheckingAuth(false);
        return;
      }

      if (token) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_PROD_API_URL}/auth/verify-token`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await res.json();
          if (res.ok && data.valid) {
            router.push("/tools");
          } else {
            setCheckingAuth(false);
          }
        } catch (err) {
          console.error("Token verification failed:", err);
          setCheckingAuth(false);
        }
      }
    };

    checkRedirect();

    const handlePageShow = () => {
      checkRedirect();
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/auth/login`,
          formData, // ✅ Payload goes here directly
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = res.data;
        console.log("Login Response:", result);

        if (res.status === 200 && result.token) {
          toast.success("Login successful!");
          localStorage.setItem("token", result.token);
          if (result.refreshToken) {
            localStorage.setItem("refreshToken", result.refreshToken);
          }
          localStorage.setItem("user", JSON.stringify(result.user));

          // Sync context state immediately
          setToken(result.token);
          setUser(result.user);

          const redirectPath = localStorage.getItem("redirectAfterLogin");
          console.log("Redirect Path from storage:", redirectPath);

          if (redirectPath && redirectPath !== "/gain-access" && redirectPath !== "/login") {
            console.log("Redirecting to:", redirectPath);
            setTimeout(() => {
              localStorage.removeItem("redirectAfterLogin");
              router.push(redirectPath);
            }, 100);
          } else {
            console.log("No redirect path found. Going to home page.");
            router.push("/");
          }
        } else {
          toast.error(result.message || "Login failed");
        }
      } catch (err) {
        console.error("Login error:", err);
        toast.error(
          err.response?.data?.message || "Something went wrong. Try again."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrors({ forgotEmail: "Email is required" });
      return;
    }
    try {
      setLoading(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/auth/forgot-password`,
        { email: forgotEmail }
      );
      toast.success("OTP sent to your email!");
      setFlowMode("forgot_otp");
      setErrors({});
    } catch (err) {
      console.error("Request OTP error:", err);
      toast.error(err.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      setErrors({ otpCode: "Verification code is required" });
      return;
    }
    try {
      setLoading(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/auth/verify-otp`,
        { email: forgotEmail, otp: otpCode }
      );
      toast.success("Code verified successfully!");
      setFlowMode("forgot_reset");
      setErrors({});
    } catch (err) {
      console.error("Verify OTP error:", err);
      toast.error(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!newPassword || newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      setLoading(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/auth/reset-password`,
        { email: forgotEmail, otp: otpCode, newPassword }
      );
      toast.success("Password reset successful!");
      setFlowMode("login");
      setFormData({ email: forgotEmail, password: "" });
      setForgotEmail("");
      setOtpCode("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (err) {
      console.error("Reset Password error:", err);
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4 text-[color:var(--text-body)]">
        <div className="text-center">
           <div className="w-12 h-12 border-4 border-[color:var(--gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
           <p className="text-sm text-[color:var(--text-muted)] tracking-wider">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4 text-[color:var(--text-body)]">
      <div className="relative w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-card)] p-8 text-[color:var(--text-body)] shadow-[var(--shadow-elevated)] animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => {
            if (flowMode !== "login") {
              setFlowMode("login");
              setErrors({});
            } else {
              router.back();
            }
          }}
          className="absolute top-3 right-3 text-[color:var(--text-muted)] hover:text-[color:var(--text-heading)] transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {flowMode === "login" && (
          <>
            <h2 className="mb-2 text-center text-4xl font-extrabold text-[color:var(--text-heading)]">
              Welcome Back
            </h2>
            <p className="mb-6 text-center text-sm text-[color:var(--text-muted)]">
              Please enter your credentials to Gain Access
            </p>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-[color:var(--text-body)]">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-2 ${
                    errors.email ? "border-[color:var(--danger)]" : "border-[color:var(--border)]"
                  } bg-[color:var(--surface-subtle)] text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]`}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-[color:var(--danger)]">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="mb-2 relative">
                <label className="mb-1 block text-sm font-medium text-[color:var(--text-body)]">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-2 ${
                    errors.password ? "border-[color:var(--danger)]" : "border-[color:var(--border)]"
                  } bg-[color:var(--surface-subtle)] text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-10 text-[color:var(--text-muted)] hover:text-[color:var(--gold)]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-[color:var(--danger)]">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setFlowMode("forgot_email");
                    setErrors({});
                  }}
                  className="text-xs font-semibold text-[color:var(--gold)] hover:text-[color:var(--gold-strong)] hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`mt-4 w-full rounded-lg border border-[color:var(--gold)] bg-[color:var(--gold)] py-3 text-center font-semibold text-[color:var(--text-inverse)] hover:bg-[color:var(--gold-strong)] transition-all ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Authenticating..." : "Gain Access"}
              </button>
            </form>

            {/* "OR" Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="w-full border-t border-[color:var(--border)]" />
              <span className="absolute bg-[color:var(--surface-card)] px-3 text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
                OR
              </span>
            </div>

            {/* Social Login */}
            <div>
              <GoogleLoginButton />
            </div>

            <p className="mt-6 text-center text-sm text-[color:var(--text-muted)]">
              Don&apos;t have an account?{" "}
              <Link
                href="/join-the-network"
                className="font-medium text-[color:var(--gold)] hover:text-[color:var(--gold-strong)] hover:underline transition-colors"
              >
                Join the Network here.
              </Link>
            </p>
          </>
        )}

        {flowMode === "forgot_email" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-200">
            <h2 className="mb-2 text-center text-3xl font-extrabold text-[color:var(--text-heading)]">
              Reset Password
            </h2>
            <p className="mb-6 text-center text-sm text-[color:var(--text-muted)]">
              Enter your registered email address to receive a verification code.
            </p>

            <form onSubmit={handleRequestOtp}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-[color:var(--text-body)]">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    setErrors({});
                  }}
                  className={`w-full rounded-lg border px-4 py-2 ${
                    errors.forgotEmail ? "border-[color:var(--danger)]" : "border-[color:var(--border)]"
                  } bg-[color:var(--surface-subtle)] text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]`}
                  required
                />
                {errors.forgotEmail && (
                  <p className="mt-1 text-sm text-[color:var(--danger)]">{errors.forgotEmail}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`mt-6 w-full rounded-lg border border-[color:var(--gold)] bg-[color:var(--gold)] py-3 text-center font-semibold text-[color:var(--text-inverse)] hover:bg-[color:var(--gold-strong)] transition-all ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Sending Code..." : "Send Verification Code"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFlowMode("login");
                  setErrors({});
                }}
                className="mt-4 w-full text-center text-sm font-medium text-[color:var(--text-muted)] hover:text-[color:var(--text-heading)] transition-colors"
              >
                Back to Login
              </button>
            </form>
          </div>
        )}

        {flowMode === "forgot_otp" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-200">
            <h2 className="mb-2 text-center text-3xl font-extrabold text-[color:var(--text-heading)]">
              Verify OTP
            </h2>
            <p className="mb-6 text-center text-sm text-[color:var(--text-muted)]">
              We sent a 6-digit OTP code to <span className="font-semibold text-[color:var(--text-heading)]">{forgotEmail}</span>.
            </p>

            <form onSubmit={handleVerifyOtp}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-[color:var(--text-body)]">
                  Verification Code
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value);
                    setErrors({});
                  }}
                  className={`w-full rounded-lg border px-4 py-2 tracking-widest text-center text-lg font-bold ${
                    errors.otpCode ? "border-[color:var(--danger)]" : "border-[color:var(--border)]"
                  } bg-[color:var(--surface-subtle)] text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)] placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]`}
                  maxLength={6}
                  required
                />
                {errors.otpCode && (
                  <p className="mt-1 text-sm text-[color:var(--danger)]">{errors.otpCode}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`mt-6 w-full rounded-lg border border-[color:var(--gold)] bg-[color:var(--gold)] py-3 text-center font-semibold text-[color:var(--text-inverse)] hover:bg-[color:var(--gold-strong)] transition-all ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFlowMode("forgot_email");
                  setErrors({});
                }}
                className="mt-4 w-full text-center text-sm font-medium text-[color:var(--text-muted)] hover:text-[color:var(--text-heading)] transition-colors"
              >
                Change Email Address
              </button>
            </form>
          </div>
        )}

        {flowMode === "forgot_reset" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-200">
            <h2 className="mb-2 text-center text-3xl font-extrabold text-[color:var(--text-heading)]">
              Set New Password
            </h2>
            <p className="mb-6 text-center text-sm text-[color:var(--text-muted)]">
              Please choose a new secure password.
            </p>

            <form onSubmit={handleResetPassword}>
              {/* New Password */}
              <div className="mb-4 relative">
                <label className="mb-1 block text-sm font-medium text-[color:var(--text-body)]">
                  New Password
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password (min 8 chars)"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrors({ ...errors, newPassword: "" });
                  }}
                  className={`w-full rounded-lg border px-4 py-2 ${
                    errors.newPassword ? "border-[color:var(--danger)]" : "border-[color:var(--border)]"
                  } bg-[color:var(--surface-subtle)] text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-10 text-[color:var(--text-muted)] hover:text-[color:var(--gold)]"
                  aria-label="Toggle password visibility"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-[color:var(--danger)]">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-4 relative">
                <label className="mb-1 block text-sm font-medium text-[color:var(--text-body)]">
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({ ...errors, confirmPassword: "" });
                  }}
                  className={`w-full rounded-lg border px-4 py-2 ${
                    errors.confirmPassword ? "border-[color:var(--danger)]" : "border-[color:var(--border)]"
                  } bg-[color:var(--surface-subtle)] text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-10 text-[color:var(--text-muted)] hover:text-[color:var(--gold)]"
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-[color:var(--danger)]">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`mt-6 w-full rounded-lg border border-[color:var(--gold)] bg-[color:var(--gold)] py-3 text-center font-semibold text-[color:var(--text-inverse)] hover:bg-[color:var(--gold-strong)] transition-all ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
