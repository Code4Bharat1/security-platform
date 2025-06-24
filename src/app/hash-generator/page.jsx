"use client";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import HashGenerator from "@/components/hashgenerator/HashGenerator";

export default function HashGeneratorPage() {
  return (
    <main>
      <Navbar />
      <HashGenerator />
      <Footer />
    </main>
  );
}
