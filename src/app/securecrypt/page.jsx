"use client";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import SecureCrypt from "@/components/securecrypt/SecureCrypt";

export default function SecureCryptPage() {
  return (
    <main>
      <Navbar />
      <SecureCrypt />
      <Footer />
    </main>
  );
}
