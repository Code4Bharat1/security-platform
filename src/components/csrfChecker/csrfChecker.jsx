
'use client'

import { useState } from 'react'

export default function CSRFChecker() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    setLoading(true)
    const res = await fetch('/api/csrf-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => setCode(e.target.result)
    reader.readAsText(file)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">CSRF Vulnerability Checker</h1>

      <textarea
        className="w-full h-48 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Paste HTML or frontend code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <input
        type="file"
        accept=".html,.js"
        onChange={handleFileUpload}
        className="my-4"
      />

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className={`px-6 py-2 rounded-md text-white font-semibold ${
          loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {result && (
        <div className="mt-6 border rounded-lg p-6 shadow-md bg-white space-y-4">
          <h2 className="text-xl font-semibold">Analysis Results</h2>
          <p className={`font-bold ${result.vulnerable ? 'text-red-600' : 'text-green-600'}`}>
            {result.vulnerable ? '⚠️ Potential CSRF vulnerabilities found' : '✅ No critical CSRF issues detected'}
          </p>

          <div>
            <h3 className="font-semibold mb-2">Details:</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {result.issues.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Suggestions:</h3>
            <ul className="list-disc list-inside text-sm text-gray-700">
              <li>Ensure all forms include CSRF tokens.</li>
              <li>Avoid cross-origin POST requests without validation.</li>
              <li>Use the `SameSite=Strict` cookie attribute.</li>
              <li>Validate origin headers on the server side.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
