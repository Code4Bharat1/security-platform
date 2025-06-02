'use client'
import { useState } from 'react'

export default function JWTSignatureValidator() {
  const [token, setToken] = useState('')
  const [secret, setSecret] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleValidate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/jwt-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, secret }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Invalid JWT')
      }
    } catch (err) {
      setError('Something went wrong')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">JWT Signature Validator</h1>

      <textarea
        placeholder="Paste JWT here..."
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className="w-full border p-2 rounded"
        rows={4}
      />

      <input
        type="text"
        placeholder="Secret key"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <button
        onClick={handleValidate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Validating...' : 'Validate'}
      </button>

      {error && <p className="text-red-600">{error}</p>}

      {result && (
        <div className="border rounded p-4 bg-gray-50 space-y-2">
          <p className="text-green-600 font-semibold">✅ Signature is valid</p>
          <div>
            <h2 className="font-bold">Header:</h2>
            <pre className="bg-white p-2 border rounded text-sm overflow-x-auto">{JSON.stringify(result.header, null, 2)}</pre>
          </div>
          <div>
            <h2 className="font-bold">Payload:</h2>
            <pre className="bg-white p-2 border rounded text-sm overflow-x-auto">{JSON.stringify(result.payload, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
