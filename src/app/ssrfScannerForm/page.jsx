import Navbar from '@/components/layout/navbar'
import SSRFScanner from '@/components/ssrfScannerForm/ssrfScanner'
import React from 'react'

export default function Page() {
  return (
    <div>
    <Navbar/>
    <SSRFScanner/>  
    </div>
  )
}
