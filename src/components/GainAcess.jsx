"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from 'react-hot-toast';

export default function GainAccess() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

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
      <div className="relative w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-card)] p-8 text-[color:var(--text-body)] shadow-[var(--shadow-elevated)]">
        {/* Close Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-3 right-3 text-[color:var(--text-muted)] hover:text-[color:var(--text-heading)]"
          aria-label="Close"
        >
          <X size={24} />
        </button>

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
          <div className="mb-4 relative">
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`mt-6 w-full rounded-lg border border-[color:var(--gold)] bg-[color:var(--gold)] py-3 text-center font-semibold text-[color:var(--text-inverse)] hover:bg-[color:var(--gold-strong)] ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Authenticating..." : "Gain Access"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[color:var(--text-muted)]">
          Don&apos;t have an account?{" "}
          <Link
            href="/join-the-network"
            className="font-medium text-[color:var(--gold)] hover:text-[color:var(--gold-strong)] hover:underline"
          >
            Join the Network here.
          </Link>
        </p>
      </div>
    </div>
  );
}
