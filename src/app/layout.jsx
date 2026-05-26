"use client"

// IMPORTANT REMOVE "use client" and uncomment the `metadata` and 
// remove ctonditional bgColor Rendering in final deploymen
import { Geist, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import WhatsApp from '@/components/WhatsApp/WhatsApp';
import Chatbot from '@/components/Chatbot/chatbot';

const themeInitScript = `
  (() => {
    try {
      const storageKey = "nexcore-theme";
      const root = document.documentElement;
      const stored = localStorage.getItem(storageKey);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = stored === "light" || stored === "dark"
        ? stored
        : (prefersDark ? "dark" : "light");
      root.classList.remove("theme-light", "theme-dark");
      root.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
      root.style.colorScheme = theme;
      root.dataset.theme = theme;
    } catch (error) {
      document.documentElement.classList.add("theme-dark");
      document.documentElement.style.colorScheme = "dark";
      document.documentElement.dataset.theme = "dark";
    }
  })();
`;

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        suppressHydrationWarning
        className={`${spaceGrotesk.variable} ${geist.variable} ${jetBrainsMono.variable} antialiased`}
      >
          <Navbar />
          {children}
          < WhatsApp />
          < Chatbot />
          <Footer />
      </body>
    </html>
  );
}
