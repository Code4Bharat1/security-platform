"use client";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import WhatsAppInspector from "@/components/whatsapp/WhatsAppInspector";

export default function WhatsAppPage() {
  return (
    <main>
      <Navbar />
      <WhatsAppInspector />
      <Footer />
    </main>
  );
}
