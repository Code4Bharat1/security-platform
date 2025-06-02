import Navbar from '@/components/layout/navbar'
import CodeObfuscationChecker from '@/components/obfuscationChecker/obfuscationChecker'
import React from 'react'

export default function Page() {
  return (
    <div>
    <Navbar/>
    <CodeObfuscationChecker/>
    </div>
  )
}
