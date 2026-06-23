"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedWrapper({ children }) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      const currentPath = window.location.pathname + window.location.search;

      if (!token) {
        localStorage.setItem("redirectAfterLogin", currentPath);
        router.replace("/gain-access");
        return;
      }

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

        if (!res.ok || !data.valid) {
          localStorage.setItem("redirectAfterLogin", currentPath);
          router.replace("/gain-access");
          return;
        }

        setVerified(true);
      } catch (err) {
        console.error("💥 Token check failed:", err);
        localStorage.setItem("redirectAfterLogin", currentPath);
        router.replace("/gain-access");
      }
    };

    verifyToken();
  }, [router]);

  if (!verified) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Checking authentication...
      </div>
    );
  }

  return children;
}
