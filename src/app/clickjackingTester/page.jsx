import ClickjackingTester from '@/components/clickjackingTester/clickjackingTester'
import Navbar from '@/components/layout/navbar'
import React from 'react'

export default function Page() {
  return (
    <div>
    <Navbar/>
    <ClickjackingTester/>  
    </div>
  )
}

