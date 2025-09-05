import { Suspense } from "react";
// export const dynamic = "force-dynamic";
import Home from "@/components/Home/Home";

export default function Landing() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Home />
    </Suspense>
  );
}
