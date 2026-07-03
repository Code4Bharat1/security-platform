"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedWrapper({ children }) {
  const { verifySession } = useAuth();
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await verifySession();
      if (!isValid) {
        const currentPath = window.location.pathname + window.location.search;
        localStorage.setItem("redirectAfterLogin", currentPath);
        router.replace("/gain-access");
      } else {
        setVerified(true);
      }
    };
    checkAuth();
  }, [verifySession, router]);

  if (!verified) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500 bg-black">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[color:var(--gold)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-gray-400 tracking-wider">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return children;
}
