// app/pagespeed/page.jsx
"use client";

import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import SpeedPage from "@/components/SpeedForm/SpeedForm";

export default function PageSpeedWrapper() {
  return (
    <main >
      <Navbar />
      <SpeedPage />
      <Footer />
    </main>
  );
}
