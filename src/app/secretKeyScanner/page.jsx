import Navbar from '@/components/layout/navbar'
import SecretKeyScanner from '@/components/secretKeyScanner/secretKeyScanner'
import React from 'react'

export default function Page() {
  return (
    <div>
      <Navbar/>
      <SecretKeyScanner/>
    </div>
  )
}
