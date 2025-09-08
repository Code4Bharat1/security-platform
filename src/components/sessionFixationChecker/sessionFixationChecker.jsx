  'use client';

  import { useRef, useState } from 'react';
  import { jsPDF } from 'jspdf';
  import autoTable from 'jspdf-autotable';
  import { Shield, Upload, AlertTriangle, CheckCircle, FileText, X, Lock, Download } from 'lucide-react';

  export default function SessionFixationChecker() {
    const [code, setCode] = useState('');
    const [report, setReport] = useState(null);   // findings[]
    const [summary, setSummary] = useState(null); // { totalFindings, critical, high, medium, low, overallRisk }
    const [metrics, setMetrics] = useState(null); // cookie flags etc.
    const [comparison, setComparison] = useState(null);
    const [reportId, setReportId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState([]);     // {id, message, type}
    const reportRef = useRef(null);

    const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || '').replace(/\/+$/, '');

    const addToast = (message, type = 'info') => {
      const id = Date.now();
      setToasts((p) => [...p, { id, message, type }]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 5000);
    };
    const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

    const handleLookup = async (e) => {
      e?.preventDefault?.();

      setReport(null);
      setSummary(null);
      setMetrics(null);
      setComparison(null);
      setReportId(null);

      const v = code.trim();
      if (!v) {
        addToast('Please enter some code to analyze', 'error');
        return;
      }
      if (!apiBase) {
        addToast('API base URL not set. Define NEXT_PUBLIC_PROD_API_URL.', 'error');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/session/sessionFixationChecker`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: v }),
        });

        const json = await res.json();

        if (!res.ok) {
          addToast(json?.error || 'Failed to analyze code.', 'error');
        } else {
          setReport(json?.report || []);
          setSummary(json?.summary || null);
          setMetrics(json?.metrics || null);
          setComparison(json?.comparison || null);
          setReportId(json?.reportId || null);

          const high = (json?.report || []).filter((x) => (x.severity || '').toLowerCase() === 'high').length;
          const crit = (json?.report || []).filter((x) => (x.severity || '').toLowerCase() === 'critical').length;
          if (crit) addToast(`Critical: ${crit} findings`, 'error');
          else if (high) addToast(`High: ${high} findings`, 'warning');
          else addToast(`Analysis complete (${json?.report?.length || 0} issues)`, 'success');
        }
      } catch (err) {
        addToast('Network error: ' + (err?.message || String(err)), 'error');
      } finally {
        setLoading(false);
      }
    };

    const handleFileUpload = (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      if (!/\.(js|jsx|ts|tsx|php|py|java|cs|rb|go|txt)$/i.test(f.name)) {
        addToast('Upload a valid code file', 'error');
        return;
      }
      const r = new FileReader();
      r.onload = (ev) => {
        setCode(String(ev.target?.result || ''));
        addToast(`Loaded ${f.name}`, 'success');
      };
      r.onerror = () => addToast('Failed to read file', 'error');
      r.readAsText(f);
    };

    // Exports (server)
    const openExport = (fmt) => {
      if (!reportId) {
        addToast('Analyze first to get a report id', 'error');
        return;
      }
      if (!apiBase) {
        addToast('API base URL not set. Define NEXT_PUBLIC_PROD_API_URL.', 'error');
        return;
      }
      window.open(`${apiBase}/session/sessionFixationChecker/export/${reportId}?format=${fmt}`, '_blank');
    };

    // PDF (client)
    const fileSafe = (s) => s.replace(/[^\w\-]+/g, '_').replace(/_+/g, '_').toLowerCase();

    const downloadPDF = () => {
      if (!report) {
        addToast('No report to export', 'error');
        return;
      }
      const doc = new jsPDF({ unit: 'pt' });
      doc.setFontSize(16);
      doc.text('Session Fixation Security Report', 40, 40);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 58);
      if (summary) {
        doc.text(`Overall Risk: ${summary.overallRisk}`, 40, 74);
        doc.text(
          `Findings: ${summary.totalFindings}  |  Critical: ${summary.critical}  High: ${summary.high}  Medium: ${summary.medium}  Low: ${summary.low}`,
          40,
          90
        );
      }

      autoTable(doc, {
        startY: 110,
        head: [['Severity', 'Rule', 'Message', 'Confidence', 'Exploitability', 'CVSS', 'Lines']],
        body: (report || []).map((it) => [
          it.severity || '',
          it.rule || '',
          String(it.message || '').slice(0, 120),
          it.confidence || '',
          it.exploitability || '',
          it.cvss ?? '',
          (it.locations || []).map((l) => l.line).join(';'),
        ]),
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [230, 230, 230] },
        columnStyles: { 2: { cellWidth: 240 } },
        margin: { left: 40, right: 40 },
      });

      doc.addPage();
      doc.setFontSize(12);
      doc.text('Recommendations', 40, 40);
      const recs = [
        'Regenerate session ID after login and privilege escalation.',
        'Use HttpOnly, Secure, SameSite for cookies; set sensible maxAge.',
        'Strong randomness (crypto.randomBytes(32)/uuid v4/nanoid).',
        'Bind session to IP/UA where appropriate; invalidate on change.',
        'Enforce MFA for sensitive actions.',
        'Destroy session on logout; HTTPS only with HSTS enabled.',
      ];
      doc.setFontSize(10);
      let y = 60;
      recs.forEach((t) => {
        doc.text(`• ${t}`, 48, y);
        y += 16;
      });

      doc.save(`${fileSafe('session-fixation-report')}.pdf`);
      addToast('PDF report downloaded', 'success');
    };

    // UI helpers
    const getSeverityIcon = (s) => {
      const v = (s || '').toLowerCase();
      if (v === 'critical' || v === 'high') return <AlertTriangle className="w-5 h-5 text-red-400" />;
      if (v === 'medium') return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      return <Shield className="w-5 h-5 text-green-400" />;
    };
    const badge = (s) => {
      const v = (s || '').toLowerCase();
      if (v === 'critical') return 'bg-red-900/30 text-red-300 border-white-700';
      if (v === 'high') return 'bg-red-900/30 text-red-300 border-white-700';
      if (v === 'medium') return 'bg-yellow-900/30 text-yellow-300 border-yellow-700';
      return 'bg-green-900/30 text-green-300 border-green-700';
    };

    return (
      <div className="min-h-screen bg-black text-white">
        {/* toasts */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`border rounded-lg p-4 shadow-lg max-w-sm ${
                t.type === 'error'
                  ? 'bg-red-900/20 border-white-700 text-red-300'
                  : t.type === 'success'
                  ? 'bg-green-900/20 border-green-700 text-green-300'
                  : t.type === 'warning'
                  ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300'
                  : 'bg-blue-900/20 border-blue-700 text-blue-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {t.type === 'error' || t.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                <p className="text-sm flex-1">{t.message}</p>
                <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
<div className="flex items-center gap-4 mb-8">
  <div className="w-20 h-20 rounded-full overflow-hidden">
    <img
      src="/Redteam/api.png" // <-- yahan apni image ka path dijiye
      alt="Logo"
      className="w-full h-full object-cover"
    />
  </div>
  <div>
    <h1 className="text-xl font-bold text-white">Session Fixation Checker</h1>
    <p className="text-gray-400 text-sm">Deep static checks + exports (JSON/CSV/PDF)</p>
  </div>
</div>


          {/* Server - Side Code Section */}
          <div className="mb-6">
            <div className="bg-gray-900 rounded-lg border border-white-700 p-6">
              <h2 className="text-white text-lg font-semibold mb-4">Server - Side Code</h2>
              
              <div>
                <textarea
                  rows={8}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your login / session code....."
                  className="w-full bg-black border border-white-600 rounded-lg p-4 text-white font-mono text-sm focus:outline-none focus:border-white-500 resize-none placeholder-gray-500"
                />
                
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={handleLookup}
                    disabled={loading}
                    className={`px-8 py-2 rounded-lg font-medium transition-all ${
                      loading 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {loading ? 'Analyzing...' : 'Analyze'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Code File Button */}
          <div className="mb-6">
            <label className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Code File
              <input
                type="file"
                accept=".js,.jsx,.ts,.tsx,.php,.py,.java,.cs,.rb,.go,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <p className="text-gray-500 text-sm mt-2">Supported: JS/TS, PHP, Python, Java, C#, Ruby, Go, TXT</p>
          </div>

          {/* Downloads */}
          {report && (
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openExport('json')}
                className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download JSON
              </button>
              <button
                onClick={() => openExport('csv')}
                className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download CSV
              </button>
              <button 
                onClick={downloadPDF} 
                className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          )}

          {/* Results Section */}
          {report !== null && (
            <div ref={reportRef} className="space-y-6">
              {(summary || metrics) && (
                <div className="bg-gray-900 rounded-lg border border-white-700 p-4">
                  {summary && (
                    <div className="mb-3 text-sm text-gray-300">
                      <strong>Overall:</strong> {summary.overallRisk} • Findings: {summary.totalFindings} (C:
                      {summary.critical} H:{summary.high} M:{summary.medium} L:{summary.low})
                    </div>
                  )}
                  {comparison && (
                    <div className="mb-3 text-xs text-gray-500">
                      {comparison.previousReportId
                        ? `Compared to prev: Δ${comparison.deltaFindings >= 0 ? '+' : ''}${comparison.deltaFindings}`
                        : 'No previous report with same code hash'}
                    </div>
                  )}
                  {metrics && (
                    <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-400">
                      <div>
                        Cookie: HttpOnly {String(metrics.cookieFlags?.httpOnly)}, Secure{' '}
                        {String(metrics.cookieFlags?.secure)}, SameSite {String(metrics.cookieFlags?.sameSite || '—')},
                        maxAge {metrics.cookieFlags?.maxAgeMs ?? '—'}
                      </div>
                      <div>Entropy: {metrics.tokenEntropyHint || '—'} • Reuse Risk: {metrics.tokenReuseRisk || '—'}</div>
                      <div>Binding: IP {metrics.ipBinding ? 'yes' : 'no'} • UA {metrics.uaBinding ? 'yes' : 'no'}</div>
                      <div>
                        MFA: {metrics.mfaPresent ? 'yes' : 'no'} • Logout invalidation:{' '}
                        {metrics.logoutInvalidation ? 'yes' : 'no'} • PrivEsc regen:{' '}
                        {metrics.regenOnPrivEsc ? 'yes' : 'no'}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {Array.isArray(report) && report.length > 0 ? (
                <>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                    <h2 className="text-xl font-semibold text-white">
                      Security Analysis Report ({report.length} issues)
                    </h2>
                  </div>
                  {report.map((f, i) => (
                    <div key={i} className="bg-gray-900 border border-white-700 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getSeverityIcon(f.severity)}
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${badge(f.severity)}`}>
                            {(f.severity || '').toUpperCase()} • CVSS {f.cvss ?? '—'} • {f.exploitability || '—'} exploitability
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">Rule: {f.rule || '—'}</span>
                      </div>
                      <p className="text-gray-200 mb-2">
                        <strong>Issue:</strong> {f.message}
                      </p>
                      {f.reasoning && (
                        <p className="text-sm text-gray-400 mb-2">
                          <strong>Reasoning:</strong> {f.reasoning}
                        </p>
                      )}
                      {f.attackScenario && (
                        <p className="text-sm text-gray-400 mb-2">
                          <strong>Attack:</strong> {f.attackScenario}
                        </p>
                      )}
                      {Array.isArray(f.locations) && f.locations.length > 0 && (
                        <div className="mt-3 text-xs">
                          <p className="font-semibold text-gray-300 mb-1">Locations:</p>
                          <ul className="list-disc ml-5 space-y-1">
                            {f.locations.slice(0, 5).map((loc, k) => (
                              <li key={k}>
                                <code className="text-red-300">Line {loc.line}</code> — <span className="text-gray-500">{loc.snippet}</span>
                              </li>
                            ))}
                          </ul>
                          {f.locations.length > 5 && <p className="text-gray-500 mt-1">+ {f.locations.length - 5} more…</p>}
                        </div>
                      )}
                      {f.suggestion && (
                        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mt-4">
                          <p className="font-semibold text-green-300 mb-1">Recommended Fix</p>
                          <p className="text-sm text-green-400">{f.suggestion}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-16">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                  <h2 className="text-2xl font-semibold text-green-400 mb-2">All Clear</h2>
                  <p className="text-gray-400 text-lg">No session fixation vulnerabilities detected</p>
                </div>
              )}
            </div>
          )}

          {/* Default State */}
          {report === null && !loading && (
            <div className="bg-gray-900 rounded-lg border border-white-700 p-16">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Ready to analyze your code</h2>
                <p className="text-gray-400">Paste server-side code and click "Analyze"</p>
              </div>
            </div>
          )}

          {/* Session Security Best Practices */}
          <div className="mt-8 bg-red-600 rounded-lg p-6 border-white-700 ">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              Session Security Best Practices
            </h3>
            <ul className="space-y-2 text-white text-sm">
              <li>• Regenerate session ID after login and privilege escalation.</li>
              <li>• Use HttpOnly, Secure, SameSite cookies; set maxAge and rolling policy.</li>
              <li>• Strong entropy for tokens; avoid Math.random/Date.now.</li>
              <li>• Validate session on every request; bind to IP/UA where appropriate.</li>
              <li>• Force HTTPS + HSTS; avoid mixed content.</li>
              <li>• Invalidate session on logout server-side; enforce MFA for sensitive flows.</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-400 text-sm mt-8 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Report exports: JSON/CSV (server) • PDF (client)</span>
          </div>
        </div>
      </div>
    );
  }