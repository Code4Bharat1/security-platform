"use client";
export const dynamic = "force-dynamic"; // stop Next.js prerender
import { Suspense } from "react";

import Hero from './Hero'
import Certifications from './Certifications'
import WhyUs from './WhyUs'
import ToolsCard from './ToolsCard'
import Blogs from './Blogs'
import Services from './Services'
function App() {
  return (
    <div>
      <Hero></Hero>
      <WhyUs></WhyUs>
      <Certifications></Certifications>
      <ToolsCard></ToolsCard>
      <Blogs></Blogs>
      <Services></Services>
    </div>
  )
}

export default App
