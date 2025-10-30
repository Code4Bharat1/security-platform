// "use client";
// import { useRouter } from "next/navigation";

// export default function withProtectedAction(WrappedComponent) {
//   return function ProtectedActionWrapper(props) {
//     const router = useRouter();

//     async function protectedAction(callback) {
//       const token = localStorage.getItem("token");
//       const currentPath = window.location.pathname + window.location.search;

//       console.log("🔐 [ProtectedAction] Triggered");
//       console.log("➡️ Current Path:", currentPath);
//       console.log("🪪 Stored Token:", token ? "✅ Present" : "❌ Missing");

//       if (!token) {
//         console.warn(
//           "⚠️ No token found, saving redirect path and going to login..."
//         );
//         localStorage.setItem("redirectAfterLogin", currentPath);
//         router.push("/gain-access");
//         return;
//       }

//       try {
//         console.log("🔍 Inspecting token...");
//         const inspectRes = await fetch(
//           `${process.env.NEXT_PUBLIC_PROD_API_URL}/auth/inspect-token`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//             body: JSON.stringify({ token }),
//           }
//         );

//         const inspectData = await inspectRes.json();
//         console.log("🧾 Inspect response:", inspectData);

//         if (!inspectRes.ok || inspectData.meta?.isExpired) {
//           console.warn("⏰ Token expired. Redirecting to login...");
//           localStorage.setItem("redirectAfterLogin", currentPath);
//           router.push("/gain-access");
//           return;
//         }

//         console.log("✅ Token valid. Executing callback...");
//         await callback(token);
//       } catch (err) {
//         console.error("💥 Token inspection failed:", err);
//         localStorage.setItem("redirectAfterLogin", currentPath);
//         router.push("/gain-access");
//       }
//     }

//     // Pass protectedAction as prop to the wrapped component
//     return <WrappedComponent {...props} protectedAction={protectedAction} />;
//   };
// }
