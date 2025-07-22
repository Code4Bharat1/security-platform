'use client'
import { useState } from 'react'

export default function TechnologyFingerprinter() {
  const [url, setUrl] = useState('')
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const analyzeTech = async () => {
    setLoading(true)
    setError('')
    setResults([])

    try {
      const res = await fetch('http://localhost:4180/api/fingerprint/fingerprint-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()
      if (res.ok) setResults(data.technologies)
      else setError(data.error || 'Something went wrong')
    } catch (err) {
      setError('Server error')
    }

    setLoading(false)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔍 Technology Fingerprinter</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="https://example.com"
          className="flex-1 border border-gray-300 p-2 rounded"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={analyzeTech}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

     {results.length > 0 && (
  <div className="mt-6">
    <h4 className="font-semibold text-sm mb-1">Detected on: {new Date().toLocaleString()}</h4>
    <table className="w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="text-left px-4 py-2">#</th>
          <th className="text-left px-4 py-2">Detected Technology</th>
        </tr>
      </thead>
      <tbody>
        {results.map((tech, index) => (
          <tr key={index} className="border-t">
            <td className="px-4 py-2">{index + 1}</td>
            <td className="px-4 py-2">{tech}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

    </div>
  )
}
