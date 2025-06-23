import Navbar from '@/components/layout/navbar'
import SensitiveFileScanner from '@/components/sensitiveFileScanner/sensitiveFileScanner'
import React from 'react'

export default function Page() {
  return (
    <div>
    <Navbar/>
    <SensitiveFileScanner/>
    </div>
  )
}
