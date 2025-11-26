"use client";
import { useRouter } from "next/navigation";

function useProtectedAction() {
  const router = useRouter();

  return async function protectedAction(callback) {
    const token = localStorage.getItem("token");
    const currentPath = window.location.pathname + window.location.search;

    console.log("🔐 [ProtectedAction] Triggered");
    console.log("➡️ Current Path:", currentPath);
    console.log("🪪 Stored Token:", token ? "✅ Present" : "❌ Missing");

    if (!token) {
      console.warn("⚠️ No token found, redirecting to login...");
      localStorage.setItem("redirectAfterLogin", currentPath);
      router.push("/gain-access");
      return;
    }

    try {
      // ✅ UPDATED: Use new verify-token endpoint
      console.log("🔍 Verifying token with backend...");

      const verifyRes = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/auth/verify-token`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("🧾 Token verification status:", verifyRes.status);

      if (!verifyRes.ok) {
        console.warn("⏰ Token invalid or expired. Redirecting to login...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.setItem("redirectAfterLogin", currentPath);
        router.push("/gain-access");
        return;
      }

      const verifyData = await verifyRes.json();
      console.log("✅ Token valid. User:", verifyData.user);

      // ✅ Execute the protected callback
      console.log("🚀 Executing protected action...");
      await callback(token);
    } catch (err) {
      console.error("💥 Token verification failed:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.setItem("redirectAfterLogin", currentPath);
      router.push("/gain-access");
    }
  };
}

export default useProtectedAction;
