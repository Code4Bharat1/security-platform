"use client"

// IMPORTANT REMOVE "use client" and uncomment the `metadata` and 
// remove ctonditional bgColor Rendering in final deploymen
import { usePathname } from 'next/navigation'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata = {
//   title: "Security Platform",
//   description: "By Code4Bharat",
// };

export default function RootLayout({ children }) {
  // let pathname = usePathname()
  // pathname = pathname.split("/")
  // const bgColor = pathname[1] === "tools" && (!pathname[2].includes("red") && !pathname[2].includes("blue") && !pathname[2].includes("green") && !pathname[2].includes("non-tech") && !pathname[2].includes("purple")) && pathname.length < 4 ? "bg-white" : "bg-black";

  // console.log(pathname, bgColor)
  return (
    <html lang="en" className={`bg-black`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-black`}
      >
          <Navbar />
          {children}
          <Footer />
      </body>
    </html>
  );
}
