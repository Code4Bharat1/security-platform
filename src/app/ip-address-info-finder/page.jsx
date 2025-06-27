"use client";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import IpInfoFinder from "@/components/ip/IpInfoFinder";

export default function IpPage() {
  return (
    <main>
      <Navbar />
      <IpInfoFinder />
      <Footer />
    </main>
  );
}
