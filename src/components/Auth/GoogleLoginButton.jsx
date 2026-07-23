"use client";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

export default function GoogleLoginButton({ onSuccessRedirect = "/tools" }) {
  const { loginWithGoogle } = useAuth();
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
        width="300"
        size="large"
        text="Sign in with Google"
      />
    </div>
  );
}
