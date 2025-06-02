import Navbar from '@/components/layout/navbar'
import OAuthTokenInspector from '@/components/OAuthTokenInspector/OAuthTokenInspector'
import React from 'react'

export default function Page() {
  return (
    <div>
      <Navbar/>
      <OAuthTokenInspector/>
    </div>
  )
}

