"use client";
import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { googleLogout } from "@react-oauth/google";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Centralized Environment-driven Session Inactivity Timers
  const idleTimerRef = useRef(null);
  const refreshPromiseRef = useRef(null);
  const WARNING_TIMEOUT = Number(process.env.NEXT_PUBLIC_WARNING_TIMEOUT) || (14 * 60 * 1000); // 14m default
  const LOGOUT_TIMEOUT = Number(process.env.NEXT_PUBLIC_LOGOUT_TIMEOUT) || (15 * 60 * 1000);   // 15m default

  // Local JWT claims decoding helper
  const decodeJWT = useCallback((tokenStr) => {
    try {
      const parts = tokenStr.split(".");
      if (parts.length !== 3) return null;
      return JSON.parse(window.atob(parts[1]));
    } catch {
      return null;
    }
  }, []);

  // Standard Logout logic
  const logout = useCallback((options = {}) => {
    const shouldRedirect = options?.redirect !== false;
    console.log("🔒 [AuthContext] User logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("redirectAfterLogin");
    if (typeof window !== "undefined") {
      localStorage.setItem("guestSessionStart", Date.now().toString());
    }
    googleLogout();
    setUser(null);
    setToken(null);
    if (shouldRedirect) {
      router.replace("/gain-access");
    }
  }, [router]);

  // Request token refresh using refreshToken
  const refreshSession = useCallback(async (currentRefreshToken) => {
    if (!currentRefreshToken) {
      logout();
      return null;
    }

    // Reuse existing refresh request promise if one is already in progress
    if (refreshPromiseRef.current) {
      console.log("🔄 [AuthContext] Reusing active refresh token request promise...");
      return refreshPromiseRef.current;
    }

    const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, "");

    refreshPromiseRef.current = (async () => {
      try {
        console.log("🔄 [AuthContext] Attempting silent token refresh...");
        const res = await fetch(
          `${apiBase}/auth/refresh-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken: currentRefreshToken }),
          }
        );

        if (!res.ok) {
          throw new Error("Token refresh endpoint returned non-ok status");
        }

        const data = await res.json();
        if (data.accessToken && data.refreshToken) {
          console.log("✅ [AuthContext] Silent token refresh succeeded");
          localStorage.setItem("token", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          localStorage.removeItem("guestSessionStart");
          setToken(data.accessToken);
          return data.accessToken;
        } else {
          throw new Error("Missing tokens in refresh payload");
        }
      } catch (err) {
        console.warn("💥 [AuthContext] Silent refresh failed:", err.message);
        const isNetworkError = err.message && (
          err.message.toLowerCase().includes("failed to fetch") || 
          err.message.toLowerCase().includes("networkerror") || 
          err.message.toLowerCase().includes("load failed")
        );
        if (isNetworkError) {
          console.warn("Network error. Unable to sync session with security server.");
        } else {
          toast.error("Session expired. Please log in again.");
          logout();
        }
        return null;
      } finally {
        // Clear active promise reference when completed
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, [logout]);

  // Session verification wrapper
  const verifySession = useCallback(async () => {
    const activeToken = localStorage.getItem("token");
    const activeRefreshToken = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user");

    if (!activeToken || !storedUser) {
      // Unauthenticated / guest user: do NOT trigger logout or redirect to /gain-access
      return false;
    }

    const payload = decodeJWT(activeToken);
    if (!payload || !payload.exp) {
      toast.error("Session invalid. Please log in again.");
      logout();
      return false;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = payload.exp - nowSec;

    if (timeUntilExpiry <= 0) {
      console.warn("⏰ [AuthContext] Access token has expired locally.");
      const refreshed = await refreshSession(activeRefreshToken);
      if (!refreshed) {
        toast.error("Session expired. Please log in again.");
        logout();
        return false;
      }
      return true;
    }

    // If token is close to expiry (within 5 minutes), refresh it silently in background
    if (timeUntilExpiry < 300) {
      console.log("⏰ [AuthContext] Access token expiring soon. Refreshing...");
      const refreshed = await refreshSession(activeRefreshToken);
      return !!refreshed;
    }

    return true;
  }, [decodeJWT, refreshSession, logout]);

  // Handle user activity to reset idle timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Only set idle timeout if user is logged in
    const activeToken = localStorage.getItem("token");
    if (!activeToken) return;

    idleTimerRef.current = setTimeout(() => {
      // Inactive. Warn user or perform automatic logout
      console.warn("⏰ [AuthContext] User idle limit reached. Automatic logout triggered.");
      toast.error("You have been logged out due to inactivity.");
      logout();
    }, LOGOUT_TIMEOUT);
  }, [logout]);

  // Google Auth
  const loginWithGoogle = async (idToken, redirectPath = "/tools") => {
    const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, "");
    const res = await fetch(`${apiBase}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: idToken })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Google auth failed")
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.removeItem("guestSessionStart");
    setToken(data.accessToken);
    setUser(data.user);
    router.push(redirectPath);
  };

  // Initialization & Listeners
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        const payload = decodeJWT(storedToken);
        if (payload && payload.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Attempt silent refresh on startup if token is expired but refresh token exists
          const storedRefreshToken = localStorage.getItem("refreshToken");
          if (storedRefreshToken) {
            const refreshedToken = await refreshSession(storedRefreshToken);
            if (refreshedToken) {
              setToken(refreshedToken);
              const refreshedUser = localStorage.getItem("user");
              if (refreshedUser) {
                setUser(JSON.parse(refreshedUser));
              }
            }
          } else {
            logout();
          }
        }
      } else {
        // Initialize guest browsing start timestamp if not set
        if (!localStorage.getItem("guestSessionStart")) {
          localStorage.setItem("guestSessionStart", Date.now().toString());
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen to local storage changes to synchronize across tabs
    const handleStorageChange = (e) => {
      if (e.key === "token" && !e.newValue) {
        console.log("🔄 [AuthContext] Token cleared in another tab. Syncing logout...");
        setUser(null);
        setToken(null);
        localStorage.setItem("guestSessionStart", Date.now().toString());
        router.replace("/gain-access");
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Setup user activity listeners for idle timeout
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((evt) => {
      window.addEventListener(evt, resetIdleTimer);
    });
    resetIdleTimer();

    // Session worker (runs every 15 seconds):
    // 1. For logged-in users: verify session token
    // 2. For guest users: allow at least 15 minutes of uninterrupted look-around before asking to log in
    const verificationInterval = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        verifySession();
      } else {
        let startTimeStr = localStorage.getItem("guestSessionStart");
        if (!startTimeStr) {
          startTimeStr = Date.now().toString();
          localStorage.setItem("guestSessionStart", startTimeStr);
        }
        const elapsedMs = Date.now() - Number(startTimeStr);
        const GUEST_LIMIT = 15 * 60 * 1000; // 15 minutes

        if (elapsedMs >= GUEST_LIMIT) {
          const pathname = window.location.pathname;
          const isAuthPage = pathname === "/gain-access" || pathname === "/join-the-network" || pathname === "/login";
          if (!isAuthPage) {
            console.warn("⏰ [AuthContext] Guest 15-minute preview limit reached. Asking for login.");
            toast("Please log in or request access to continue using platform tools.", { icon: "🔐" });
            localStorage.setItem("guestSessionStart", Date.now().toString());
            router.replace("/gain-access");
          }
        }
      }
    }, 15000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      events.forEach((evt) => {
        window.removeEventListener(evt, resetIdleTimer);
      });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      clearInterval(verificationInterval);
    };
  }, [verifySession, decodeJWT, refreshSession, resetIdleTimer, logout, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        logout,
        verifySession,
        refreshSession,
        setUser,
        setToken,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
