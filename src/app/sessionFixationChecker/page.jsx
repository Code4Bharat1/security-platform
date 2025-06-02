import Navbar from '@/components/layout/navbar'
import SessionFixationChecker from '@/components/sessionFixationChecker/sessionFixationChecker'
import React from 'react'

export default function Page() {
  return (
    <div>
      <Navbar/>
      <SessionFixationChecker/>
    </div>
  )
}

