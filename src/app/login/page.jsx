"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const verifyToken = async () => {
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
            router.replace("/");
            return;
          }
        } catch (err) {
          console.error("Token verification failed:", err);
        }
        router.replace("/gain-access");
      };
      verifyToken();
    } else {
      router.replace("/gain-access");
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center text-gray-500 bg-[#050505] font-mono text-sm">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[color:var(--text-muted)] tracking-wider uppercase">Redirecting...</p>
      </div>
    </div>
  );
}
