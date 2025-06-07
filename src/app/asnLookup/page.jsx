// app/pagespeed/page.jsx
"use client";

import ASNLookupFullPage from "@/components/asnLookup/asnLookup";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";

export default function PageSpeedWrapper() {
  return (
    <main>
      <Navbar />
      <ASNLookupFullPage />
      <Footer />
    </main>
  );
}
