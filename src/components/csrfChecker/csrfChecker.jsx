'use client'

import { useState } from 'react'
import { Shield, Upload, CheckCircle, AlertTriangle, X } from 'lucide-react'

export default function CSRFChecker() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState([])

  const API_BASE = process.env.NEXT_PUBLIC_PROD_API_URL
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
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      default: return <Shield className="w-5 h-5 text-blue-400" />
    }
  }
  const getToastBg = (type) => {
    switch (type) {
      case 'success': return 'bg-gray-800 border-green-500'
      case 'error': return 'bg-gray-800 border-red-500'
      case 'warning': return 'bg-gray-800 border-yellow-500'
      default: return 'bg-gray-800 border-blue-500'
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`${getToastBg(toast.type)} border rounded-lg p-4 shadow-lg backdrop-blur-sm max-w-sm animate-in slide-in-from-right duration-300`}>
            <div className="flex items-start gap-3">
              {getToastIcon(toast.type)}
              <p className="text-sm text-gray-300 flex-1">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
<div className="text-left mb-8">
  <div className="flex items-center justify-start gap-4 mb-6">
    <img 
      src="/RedTeam/csrf.png" 
      alt="CSRF Checker" 
      className="w-30 h-30 rounded-full border-4 border-red-500" 
    />
    <div className="text-left">
      <h1 className="text-3xl font-bold text-white">CSRF Security Analyzer</h1>
      <p className="text-gray-400 text-sm mt-1">
        Identify and prevent Cross-Site Request Forgery vulnerabilities in your code
      </p>
    </div>
  </div>
</div>


        {/* Main */}
        <div className="space-y-8">
          {/* Code Analysis */}
          <div className="bg-gray-900 rounded-xl border border-white-700 p-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
              Code Analysis
            </h2>

            <div className="space-y-4">
              <textarea
                className="w-full h-64 p-4 bg-gray-800 border border-white-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 font-mono text-sm text-gray-300 placeholder-gray-500"
                placeholder="Paste your HTML, Javascript, or frontend code here....."
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />

              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                  <input type="file" accept=".html,.js,.jsx,.ts,.tsx" onChange={handleFileUpload} className="hidden" />
                  <div className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200">
                    <Upload className="w-4 h-4 text-white" />
                    <span className="text-white font-medium text-sm">Upload File</span>
                  </div>
                </label>

                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                    loading ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-gray-700 hover:bg-gray-600 border border-white-600'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Analyzing...</span>
                    </div>
                  ) : (
                    <span className="text-sm">Analyze Code</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Security Analysis (now below Code Analysis) */}
          <div className="bg-gray-900 rounded-xl border border-white-700 p-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Security Analysis
            </h2>

            {/* Score Card */}
            {result && (
              <div className="mb-6 grid md:grid-cols-2 gap-4">
                <div className="rounded-lg p-4 border border-white-700 bg-gray-800">
                  <div className="text-gray-300 font-semibold text-sm">Security Score</div>
                  <div className={`mt-2 text-3xl font-bold ${
                    result.score >= 80 ? 'text-green-400' : result.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {result.score}/100
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    Risk Level: <span className="font-semibold">{result.riskLevel}</span>
                  </div>
                </div>

                <div className="rounded-lg p-4 border border-white-700 bg-gray-800">
                  <div className="text-gray-300 font-semibold text-sm mb-2">Checks Breakdown</div>
                  <ul className="space-y-1 text-xs">
                    <li className="flex items-center gap-2 text-gray-400">
                      <span>{result.breakdown?.tokenPresentOK ? '✅' : '❌'}</span> Token present (+30)
                    </li>
                    <li className="flex items-center gap-2 text-gray-400">
                      <span>{result.breakdown?.cookieSameSiteOK ? '✅' : '❌'}</span> Cookie SameSite (+30)
                    </li>
                    <li className="flex items-center gap-2 text-gray-400">
                      <span>{result.breakdown?.originRefererOK ? '✅' : '❌'}</span> Origin/Referrer policy (+30)
                    </li>
                    <li className="flex items-center gap-2 text-gray-400">
                      <span>{result.breakdown?.tokenRandomnessOK ? '✅' : '❌'}</span> Token randomness (+10)
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {result ? (
              <div className={`rounded-lg p-4 border ${
                result.vulnerable ? 'bg-red-950 border-red-800' : 'bg-green-950 border-green-800'
              }`}>
                <div className={`flex items-center gap-3 mb-4 text-sm font-semibold ${
                  result.vulnerable ? 'text-red-300' : 'text-green-300'
                }`}>
                  {result.vulnerable ? (<><AlertTriangle className="w-5 h-5" />Vulnerabilities Detected</>)
                                     : (<><CheckCircle className="w-5 h-5" />Code Secure</>)}
                </div>

                {result.issues?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-300 mb-2 text-sm">Issues Found:</h3>
                    <ul className="space-y-1">
                      {result.issues.map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-400">
                          <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-300 mb-2 text-sm">Security Recommendations:</h3>
                  <ul className="space-y-1 text-xs text-gray-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                      Implement CSRF tokens in all state-changing forms
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                      Use <code className="bg-gray-800 px-1 rounded text-gray-300">SameSite=Strict</code> cookie attribute
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                      Validate origin and referer headers server-side
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                      Avoid cross-origin requests without proper validation
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Shield className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-sm">Upload your code to begin security analysis</p>
                <p className="text-xs mt-1 text-gray-600">Supported formats: HTML, JS, JSX, TS, TSX</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs mt-8">
          <p>Your code is analyzed locally and securely</p>
        </div>
      </div>
    </div>
  )
}
