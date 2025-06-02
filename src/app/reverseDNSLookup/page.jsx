import Navbar from '@/components/layout/navbar'
import ReverseDNSLookup from '@/components/reverseDNSLookup/reverseDNSLookup'
import React from 'react'

export default function Page() {
  return (
    <div>
     <Navbar/>
     <ReverseDNSLookup/> 
    </div>
  )
}
