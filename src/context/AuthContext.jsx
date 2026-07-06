"use client";
import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Keep track of idle timer (increased for developer testing)
  const idleTimerRef = useRef(null);
  const WARNING_TIMEOUT = 23 * 60 * 60 * 1000; // Show extend warning at 23 hours
  const LOGOUT_TIMEOUT = 24 * 60 * 60 * 1000;  // Log out at 24 hours

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
  const logout = useCallback(() => {
    console.log("🔒 [AuthContext] User logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("redirectAfterLogin");
    setUser(null);
    setToken(null);
    router.replace("/gain-access");
  }, [router]);

  // Request token refresh using refreshToken
  const refreshSession = useCallback(async (currentRefreshToken) => {
    if (!currentRefreshToken) {
      logout();
      return null;
    }

    try {
      console.log("🔄 [AuthContext] Attempting silent token refresh...");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/auth/refresh-token`,
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
        setToken(data.accessToken);
        return data.accessToken;
      } else {
        throw new Error("Missing tokens in refresh payload");
      }
    } catch (err) {
      console.error("💥 [AuthContext] Silent refresh failed:", err.message);
      toast.error("Session expired. Please log in again.");
      logout();
      return null;
    }
  }, [logout]);

  // Session verification wrapper
  const verifySession = useCallback(async () => {
    const activeToken = localStorage.getItem("token");
    const activeRefreshToken = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user");

    if (!activeToken || !storedUser) {
      logout();
      return false;
    }

    const payload = decodeJWT(activeToken);
    if (!payload || !payload.exp) {
      logout();
      return false;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = payload.exp - nowSec;

    if (timeUntilExpiry <= 0) {
      console.warn("⏰ [AuthContext] Access token has expired locally.");
      const refreshed = await refreshSession(activeRefreshToken);
      return !!refreshed;
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

    idleTimerRef.current = setTimeout(() => {
      // Inactive. Warn user or perform automatic logout
      console.warn("⏰ [AuthContext] User idle limit reached. Automatic logout triggered.");
      toast.error("You have been logged out due to inactivity.");
      logout();
    }, LOGOUT_TIMEOUT);
  }, [logout]);

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

    // Periodic JWT validation worker (runs every 30 seconds)
    const verificationInterval = setInterval(() => {
      verifySession();
    }, 30000);

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
