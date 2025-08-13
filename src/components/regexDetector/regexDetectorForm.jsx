'use client';

import { useState } from 'react';
import { Search, Upload, AlertTriangle, CheckCircle, Shield, X, FileText, Zap } from 'lucide-react';

export default function RegexDetector() {
  const [code, setCode] = useState(`const userInput = getInput();
const regex = new RegExp(userInput); // ⚠️ Unescaped input`);
  const [results, setResults] = useState([]);
  const [fixes, setFixes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('results');
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

  const getSeverity = (risk) => {
    if (risk.includes('ReDoS')) return 'high';
    if (risk.includes('Unescaped') || risk.includes('Template')) return 'medium';
    return 'low';
  };

  const severityColors = {
    high: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    low: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const severityBadges = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
  };

  const scanCode = async () => {
    if (!code.trim()) {
      addToast('Please enter some code to scan', 'error');
      return;
    }

    setLoading(true);
    setActiveTab('results');
    setResults([]);
    setFixes([]);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/regex/regexInjectionDetector`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const issues = data.issues || [];
      const fixSuggestions = data.fixes || [];
      
      setResults(issues);
      setFixes(fixSuggestions);
      
      if (issues.length === 0) {
        addToast('✅ Great! No regex injection vulnerabilities found', 'success');
      } else {
        const highRisk = issues.filter(issue => getSeverity(issue.risk) === 'high').length;
        const mediumRisk = issues.filter(issue => getSeverity(issue.risk) === 'medium').length;
        
        if (highRisk > 0) {
          addToast(`⚠️ Found ${issues.length} issues including ${highRisk} high-risk vulnerabilities`, 'error');
        } else if (mediumRisk > 0) {
          addToast(`⚠️ Found ${issues.length} issues including ${mediumRisk} medium-risk vulnerabilities`, 'warning');
        } else {
          addToast(`Found ${issues.length} low-risk issues`, 'warning');
        }
      }
    } catch (error) {
      console.error('Error scanning code:', error);
      setResults([]);
      setFixes([]);
      addToast(`Scan failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(js|jsx|ts|tsx|txt)$/i)) {
      addToast('Please upload a valid code file (.js, .jsx, .ts, .tsx, .txt)', 'error');
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
    switch (severity) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default: return <Shield className="w-5 h-5 text-blue-600" />;
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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/regex.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
          <div className="flex items-center justify-center gap-3 mb-4">
            <Search className="w-8 h-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-800">Regex Injection Detector</h1>
          </div>
          <p className="text-gray-600 text-lg">Identify and prevent regex injection vulnerabilities in your JavaScript code</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* File Upload */}
          <div className="mb-6">
            <label className="flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl w-fit">
              <Upload className="w-5 h-5" />
              <span className="font-medium">Choose File</span>
              <input
                type="file"
                accept=".js,.jsx,.ts,.tsx,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">Supported formats: JS, JSX, TS, TSX, TXT</p>
          </div>

          {/* Code Input */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              <FileText className="w-5 h-5 inline mr-2 text-green-600" />
              Code to Analyze
            </label>
            <textarea
              rows={12}
              className="w-full p-4 rounded-xl border-2 border-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Paste your JavaScript code here..."
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}           />
          </div>

          {/* Scan Button */}
          <button
            className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 flex items-center gap-2 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
            }`}
            onClick={scanCode}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Scan Code
              </>
            )}
          </button>

          {/* Tabs */}
          <div className="flex space-x-2 mt-8 border-b border-gray-200">
            <button
              className={`px-4 py-2 font-medium rounded-t-lg transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'results' 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
              onClick={() => setActiveTab('results')}
            >
              <AlertTriangle className="w-4 h-4" />
              Issues ({results.length})
            </button>
            <button
              className={`px-4 py-2 font-medium rounded-t-lg transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'fixes' 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
              onClick={() => setActiveTab('fixes')}
            >
              <Zap className="w-4 h-4" />
              Auto-fix Preview ({fixes.length})
            </button>
          </div>

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="mt-6">
              {results.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    Issues Found: {results.length}
                  </h2>
                  {results.map((issue, idx) => {
                    const severity = getSeverity(issue.risk);
                    return (
                      <div
                        key={idx}
                        className={`rounded-xl shadow-lg border-2 p-6 ${severityColors[severity]}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getSeverityIcon(severity)}
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${severityBadges[severity]}`}>
                              {severity.toUpperCase()} RISK
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-600">Line {issue.line}</span>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="font-semibold text-gray-800 mb-1">Pattern:</p>
                            <code className="bg-gray-800 text-green-400 px-3 py-2 rounded-lg text-sm block overflow-x-auto">
                              {issue.pattern}
                            </code>
                          </div>
                          
                          <div>
                            <p className="font-semibold text-gray-800 mb-1">Risk:</p>
                            <p className="text-gray-700">{issue.risk}</p>
                          </div>

                          {issue.risk.includes('Unescaped') && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                              <p className="font-semibold text-green-800 mb-2">💡 Suggested Fix:</p>
                              <p className="text-sm text-green-700 mb-2">Escape user input using:</p>
                              <code className="bg-green-800 text-green-300 px-3 py-2 rounded-lg text-sm block overflow-x-auto">
                                input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">
                    {loading ? 'Analyzing code...' : 'No issues found or scan not performed yet'}
                  </p>
                  <p className="text-sm mt-2">Upload your code and click "Scan Code" to begin analysis</p>
                </div>
              )}
            </div>
          )}

          {/* Auto-fix Preview Tab */}
          {activeTab === 'fixes' && (
            <div className="mt-6">
              {fixes.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
                    <Zap className="w-6 h-6 text-green-600" />
                    Suggested Fixes
                  </h2>
                  <div className="bg-gray-900 rounded-xl p-6 overflow-hidden">
                    <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {fixes.join('\n')}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <Zap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">
                    {loading ? 'Generating fixes...' : 'No auto-fixes available'}
                  </p>
                  <p className="text-sm mt-2">Fixes will appear here after scanning code with issues</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p>🔒 Your code is analyzed securely and locally</p>
        </div>
      </div>
    </div>
  );
}