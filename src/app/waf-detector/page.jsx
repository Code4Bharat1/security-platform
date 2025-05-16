import Footer from '@/components/layout/footer'
import Navbar from '@/components/layout/navbar'
import WAFDetectorPage from '@/components/waf-detector/waf-detector'
import React from 'react'

export default function Page() {
  return (
    <div>
      <Navbar/>
      <WAFDetectorPage/>
      <Footer/>
    </div>
  )
}

