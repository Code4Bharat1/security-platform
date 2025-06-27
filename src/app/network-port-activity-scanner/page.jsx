"use client";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import PortActivityScanner from "@/components/portscanner/PortActivityScanner";

export default function NetworkPortPage() {
  return (
    <main>
      <Navbar />
      <PortActivityScanner />
      <Footer />
    </main>
  );
}
