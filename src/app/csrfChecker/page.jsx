import CSRFChecker from '@/components/csrfChecker/csrfChecker'
import Navbar from '@/components/layout/navbar'
import React from 'react'

export default function Page() {
  return (
    <div>
      <Navbar/>
      <CSRFChecker/>
    </div>
  )
}

