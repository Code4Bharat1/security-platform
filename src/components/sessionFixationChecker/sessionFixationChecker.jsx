'use client';

import { useState } from 'react';
import { Shield, Upload, AlertTriangle, CheckCircle, FileText, X, Lock, Eye } from 'lucide-react';

export default function SessionFixationChecker() {
  const [code, setCode] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    const toast = { id, message, type };
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      addToast('Please enter some code to analyze', 'error');
      return;
    }

    setLoading(true);
    setReport(null);

    try {
      const res = await fetch('http://localhost:5000/api/session/sessionFixationChecker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      
      if (data.report && Array.isArray(data.report)) {
        setReport(data.report);
        
        if (data.report.length === 0) {
          addToast('✅ Excellent! No session fixation vulnerabilities found', 'success');
        } else {
          const highRisk = data.report.filter(item => item.severity?.toLowerCase() === 'high').length;
          const mediumRisk = data.report.filter(item => item.severity?.toLowerCase() === 'medium').length;
          
          if (highRisk > 0) {
            addToast(`⚠️ Critical: Found ${data.report.length} issues including ${highRisk} high-risk vulnerabilities`, 'error');
          } else if (mediumRisk > 0) {
            addToast(`⚠️ Warning: Found ${data.report.length} issues including ${mediumRisk} medium-risk vulnerabilities`, 'warning');
          } else {
            addToast(`Found ${data.report.length} low-risk security issues`, 'warning');
          }
        }
      } else {
        setReport([]);
        addToast('✅ Analysis complete - No vulnerabilities detected', 'success');
      }
    } catch (error) {
      console.error('Error analyzing code:', error);
      setReport(null);
      addToast(`Analysis failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(js|jsx|ts|tsx|php|py|java|cs|rb|go|txt)$/i)) {
      addToast('Please upload a valid code file (.js, .php, .py, .java, .cs, .rb, .go, .txt)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setCode(e.target.result);
      addToast(`File "${file.name}" loaded successfully`, 'success');
    };
    reader.onerror = () => {
      addToast('Failed to read file', 'error');
    };
    reader.readAsText(file);
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default: return <Shield className="w-5 h-5 text-blue-600" />;
    }
  };

  const getToastBg = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'low': return <Shield className="w-5 h-5 text-green-600" />;
      default: return <Eye className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityColors = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'border-red-500 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-green-500 bg-green-50 text-green-800';
      default: return 'border-gray-400 bg-gray-50 text-gray-800';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`${getToastBg(toast.type)} border rounded-lg p-4 shadow-lg backdrop-blur-sm max-w-sm animate-in slide-in-from-right duration-300`}
          >
            <div className="flex items-start gap-3">
              {getToastIcon(toast.type)}
              <p className="text-sm text-gray-700 flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lock className="w-8 h-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-800">Session Fixation Checker</h1>
          </div>
          <p className="text-gray-600 text-lg">Detect and prevent session fixation vulnerabilities in your server-side code</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* File Upload */}
          <div className="mb-6">
            <label className="flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl w-fit">
              <Upload className="w-5 h-5" />
              <span className="font-medium">Upload Code File</span>
              <input
                type="file"
                accept=".js,.jsx,.ts,.tsx,.php,.py,.java,.cs,.rb,.go,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">Supported formats: JS, JSX, TS, TSX, PHP, Python, Java, C#, Ruby, Go, TXT</p>
          </div>

          {/* Code Input */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              <FileText className="w-5 h-5 inline mr-2 text-green-600" />
              Server-Side Code
            </label>
            <textarea
              rows={14}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your server-side login/session management code here...

Example patterns to check:
- Session ID regeneration after login
- Secure session cookie attributes
- Session validation mechanisms
- Authentication state management"
              className="w-full border-2 border-gray-200 rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing Security...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Analyze for Session Fixation
              </>
            )}
          </button>

          {/* Results */}
          {report !== null && (
            <div className="mt-8">
              {report.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Security Analysis Report ({report.length} issues found)
                    </h2>
                  </div>
                  
                  {report.map((item, idx) => (
                    <div
                      key={idx}
                      className={`border-l-4 rounded-xl shadow-lg p-6 ${getSeverityColors(item.severity)}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getSeverityIcon(item.severity)}
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getSeverityBadge(item.severity)}`}>
                            {item.severity?.toUpperCase() || 'UNKNOWN'} RISK
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">Issue:</p>
                          <p className="text-gray-700">{item.message}</p>
                        </div>
                        
                        {item.suggestion && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="font-semibold text-green-800 mb-1">💡 Recommended Fix:</p>
                            <p className="text-sm text-green-700">{item.suggestion}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h2 className="text-2xl font-semibold text-green-700 mb-2">All Clear! 🎉</h2>
                  <p className="text-gray-600 text-lg">No session fixation vulnerabilities detected in your code</p>
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 max-w-md mx-auto">
                    <p className="text-sm text-green-700">
                      Your code appears to follow secure session management practices. Keep up the good work!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Results Yet */}
          {report === null && !loading && (
            <div className="text-center py-16 text-gray-500 mt-8">
              <Lock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Ready to analyze your code</p>
              <p className="text-sm mt-2">Paste your server-side code above and click "Analyze" to check for session fixation vulnerabilities</p>
            </div>
          )}
        </div>

        {/* Security Tips */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Session Security Best Practices
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Regenerate session ID after successful login</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Use secure cookie attributes (HttpOnly, Secure, SameSite)</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Implement proper session timeout mechanisms</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Validate session tokens on every request</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm mt-8">
          <p>🔒 Your code is analyzed securely and never stored</p>
        </div>
      </div>
    </div>
  );
}