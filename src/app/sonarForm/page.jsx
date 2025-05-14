import Footer from '@/components/layout/footer'
import Navbar from '@/components/layout/navbar'
import SonarForm from '@/components/sonarForm/sonarForm'
import React from 'react'

export default function Page() {
  return (
    <div>
      <Navbar/>
      <SonarForm/>
      <Footer/>
    </div>
  )
}

