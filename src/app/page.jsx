'use client'


import CardsList from "@/components/cardsList/cardsList";
import HeroSection from "@/components/HeroSection/HeroSection";

import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import Image from "next/image";

export default function Home() {
  return (
  <div>
    <Navbar/>
    <HeroSection/>
    <CardsList/>
    <Footer/>
  </div>
  );
}
