"use client";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ThirdPartyPermissionScanner from "@/components/permissions/ThirdPartyPermissionScanner";

export default function PermissionPage() {
  return (
    <main>
      <Navbar />
      <ThirdPartyPermissionScanner />
      <Footer />
    </main>
  );
}
