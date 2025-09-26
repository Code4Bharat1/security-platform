import { useRouter } from "next/navigation";

function useProtectedAction() {
  const router = useRouter();

  return async function protectedAction(callback) {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/gain-access");
      return;
    }

    // Inspect token
    const inspectRes = await fetch(
      `${process.env.NEXT_PUBLIC_PROD_API_URL}/auth/inspect-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      }
    );
    const inspectData = await inspectRes.json();
    if (!inspectRes.ok || inspectData.meta?.isExpired) {
      alert("Your session expired. Please login again.");
      router.push("/gain-access");
      return;
    }

    // If still valid, run whatever you pass in
    await callback(token);
  };
}

export default useProtectedAction;
