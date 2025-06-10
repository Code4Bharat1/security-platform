import FileUploadScanner from '@/components/fileScan/fileScan'
import Navbar from '@/components/layout/navbar'
import React from 'react'

export default function Page() {
  return (
    <div>
      <Navbar/>
      <FileUploadScanner/>
    </div>
  )
}
