'use client'

import { useState } from 'react'

export default function CodeObfuscationChecker() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    setLoading(true)
    const res = await fetch('http://localhost:4180/api/code/code-obfuscation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
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

  const getSeverityColor = (severity) => {
    return {
      Low: 'bg-green-500',
      Medium: 'bg-yellow-500',
      High: 'bg-red-500'
    }[severity] || 'bg-gray-500'
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Code Obfuscation Checker</h1>

      <div className="space-y-4 mb-6">
        <textarea
          className="w-full h-48 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Paste your code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <input
          type="file"
          accept=".js,.py,.ts,.jsx"
          onChange={handleFileUpload}
          className="block"
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
      </div>

      {result && (
        <div className="border rounded-lg p-6 shadow-md bg-white space-y-4">
          <h2 className="text-xl font-semibold">Analysis Results</h2>

          <div className="flex items-center gap-4">
            <span className="font-medium">Obfuscation Severity:</span>
            <span className={`text-white px-3 py-1 rounded-full ${getSeverityColor(result.severity)}`}>
              {result.severity}
            </span>
          </div>

          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Detected Issues</h3>
            <ul className="list-disc list-inside">
              <li><strong>Short Variables:</strong> {result.shortVars?.join(', ') || 'None'}</li>
              <li><strong>Encoded Strings:</strong> {result.encodedStrings?.length || 0}</li>
              <li><strong>Uses `eval`:</strong> {result.usesEval ? 'Yes' : 'No'}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Suggestions</h3>
            <ul className="list-disc list-inside text-sm text-gray-700">
              <li>Use meaningful variable names.</li>
              <li>Avoid using <code>eval()</code> unless absolutely necessary.</li>
              <li>Decode long encoded strings and store them cleanly.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
