"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function useProtectedAction() {
  const router = useRouter();
  const { verifySession, token } = useAuth();

  return async function protectedAction(callback) {
    const currentPath = window.location.pathname + window.location.search;

    console.log("🔐 [ProtectedAction] Triggered via AuthContext");
    console.log("➡️ Current Path:", currentPath);

    const isValid = await verifySession();
    if (!isValid) {
      console.warn("⚠️ Session invalid or expired, redirecting to login...");
      localStorage.setItem("redirectAfterLogin", currentPath);
      router.replace("/gain-access");
      return;
    }

    try {
      console.log("🚀 Executing protected action...");
      const activeToken = token || localStorage.getItem("token");
      await callback(activeToken);
    } catch (err) {
      console.error("💥 Action execution failed:", err);
    }
  };
}

export default useProtectedAction;
