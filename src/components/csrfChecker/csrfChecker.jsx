'use client'

import { useState } from 'react'
import { Shield, Upload, CheckCircle, AlertTriangle, X } from 'lucide-react'

export default function CSRFChecker() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState([])

  const API_BASE =
    process.env.NEXT_PUBLIC_PROD_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    '' // leave blank if you use a Next.js rewrite proxy

  const addToast = (message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  const handleAnalyze = async () => {
    if (!code.trim()) {
      addToast('Please enter some code to analyze', 'error')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const endpoint = `${API_BASE ? API_BASE.replace(/\/$/, '') : ''}/csrf/csrf-check`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to analyze code')
      }

      const data = await res.json()
      setResult(data)
      addToast(
        data.vulnerable
          ? 'CSRF vulnerabilities detected! Check the results below.'
          : 'Great! No critical CSRF issues found.',
        data.vulnerable ? 'warning' : 'success'
      )
    } catch (err) {
      addToast(`Analysis failed: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.match(/\.(html|js|jsx|ts|tsx)$/i)) {
      addToast('Please upload a valid code file (.html, .js, .jsx, .ts, .tsx)', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCode(ev.target.result)
      addToast(`File "${file.name}" loaded successfully`, 'success')
    }
    reader.onerror = () => addToast('Failed to read file', 'error')
    reader.readAsText(file)
  }

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      default: return <Shield className="w-5 h-5 text-blue-600" />
    }
  }
  const getToastBg = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200'
      case 'error': return 'bg-red-50 border-red-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      default: return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`${getToastBg(toast.type)} border rounded-lg p-4 shadow-lg backdrop-blur-sm max-w-sm animate-in slide-in-from-right duration-300`}>
            <div className="flex items-start gap-3">
              {getToastIcon(toast.type)}
              <p className="text-sm text-gray-700 flex-1">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-800">CSRF Security Analyzer</h1>
          </div>
          <p className="text-gray-600 text-lg">Identify and prevent Cross-Site Request Forgery vulnerabilities in your code</p>
        </div>

        {/* Main */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Input */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <Upload className="w-6 h-6 text-green-600" />
                Code Analysis
              </h2>

              <div className="space-y-4">
                <textarea
                  className="w-full h-64 p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
                  placeholder="Paste your HTML, JavaScript, or frontend code here..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />

                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input type="file" accept=".html,.js,.jsx,.ts,.tsx" onChange={handleFileUpload} className="hidden" />
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-green-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200">
                      <Upload className="w-5 h-5 text-green-600" />
                      <span className="text-green-700 font-medium">Upload File</span>
                    </div>
                  </label>

                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 ${
                      loading ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analyzing...
                      </div>
                    ) : 'Analyze Code'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Results */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Security Analysis
              </h2>

              {/* ---- Score Card goes INSIDE the component, before the details ---- */}
              {result && (
                <div className="mb-2 grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl p-6 border-2 bg-white">
                    <div className="text-gray-800 font-bold text-lg">Security Score</div>
                    <div className={`mt-2 text-4xl font-extrabold ${
                      result.score >= 80 ? 'text-green-600' : result.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {result.score}/100
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      Risk Level: <span className="font-semibold">{result.riskLevel}</span>
                    </div>
                  </div>

                  <div className="rounded-xl p-6 border-2 bg-white">
                    <div className="text-gray-800 font-bold text-lg mb-2">Checks Breakdown</div>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <span>{result.breakdown?.tokenPresentOK ? '✅' : '❌'}</span> Token present (+30)
                      </li>
                      <li className="flex items-center gap-2">
                        <span>{result.breakdown?.cookieSameSiteOK ? '✅' : '❌'}</span> Cookie SameSite (+30)
                      </li>
                      <li className="flex items-center gap-2">
                        <span>{result.breakdown?.originRefererOK ? '✅' : '❌'}</span> Origin/Referrer policy (+30)
                      </li>
                      <li className="flex items-center gap-2">
                        <span>{result.breakdown?.tokenRandomnessOK ? '✅' : '❌'}</span> Token randomness (+10)
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {result ? (
                <div className={`rounded-xl p-6 border-2 ${
                  result.vulnerable ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                }`}>
                  <div className={`flex items-center gap-3 mb-4 text-lg font-bold ${
                    result.vulnerable ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {result.vulnerable ? (<><AlertTriangle className="w-6 h-6" />Vulnerabilities Detected</>)
                                       : (<><CheckCircle className="w-6 h-6" />Code Secure</>)}
                  </div>

                  {result.issues?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3">Issues Found:</h3>
                      <ul className="space-y-2">
                        {result.issues.map((issue, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Security Recommendations:</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        Implement CSRF tokens in all state-changing forms
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        Use <code className="bg-gray-100 px-1 rounded">SameSite=Strict</code> cookie attribute
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        Validate origin and referer headers server-side
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        Avoid cross-origin requests without proper validation
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Upload your code to begin security analysis</p>
                  <p className="text-sm mt-2">Supported formats: HTML, JS, JSX, TS, TSX</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p>🔒 Your code is analyzed locally and securely</p>
        </div>
      </div>
    </div>
  )
}
