import JWTSignatureValidator from '@/components/JWTSignatureValidator/JWTSignatureValidator'
import Navbar from '@/components/layout/navbar'
import React from 'react'

export default function Page() {
  return (
    <div>
      <Navbar/>
      <JWTSignatureValidator/>
    </div>
  )
}

