"use client";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";

export default function GoogleLoginButton({ onSuccessRedirect = "/tools" }) {
  const { loginWithGoogle } = useAuth();

  // Ignore the browser warning as it does not break the application or security features.
  // This warning is thrown by the browser due to the COOP policy.
  useEffect(() => {
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    const suppressGoogleWarning = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('Cross-Origin-Opener-Policy policy would block window.postMessage call.')) {
        return;
      }
      originalConsoleWarn.apply(console, args);
    };

    console.warn = suppressGoogleWarning;
    console.error = suppressGoogleWarning;

    return () => {
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, []);

  const handleSuccess = async (credentialResponse) => {
    console.log(jwtDecode(credentialResponse.credential));
    try {
      await loginWithGoogle(credentialResponse.credential, onSuccessRedirect);
      toast.success("Google login successful!");
    } catch (err) {
      toast.error(err.message || "Google authentication failed.");
    }
  };
  return (
    <div className="w-full flex justify-center my-3" style={{ colorScheme: "light" }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error("Google Authentication Failed")}
        theme="filled_white"
        shape="pill"
        size="large"
        text="Sign in with Google"
        use_fedcm_for_prompt={true}
      />
    </div>
  );
}
