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
    if (v === 'critical' || v === 'high') return <AlertTriangle className="w-5 h-5 text-red-600" />;
    if (v === 'medium') return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <Shield className="w-5 h-5 text-green-600" />;
  };
  const badge = (s) => {
    const v = (s || '').toLowerCase();
    if (v === 'critical') return 'bg-red-100 text-red-800 border-red-200';
    if (v === 'high') return 'bg-red-100 text-red-800 border-red-200';
    if (v === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`border rounded-lg p-4 shadow-lg max-w-sm ${
              t.type === 'error'
                ? 'bg-red-50 border-red-200'
                : t.type === 'success'
                ? 'bg-green-50 border-green-200'
                : t.type === 'warning'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {t.type === 'error' || t.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              <p className="text-sm text-gray-700 flex-1">{t.message}</p>
              <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <img src="/tools/card-images/session_fixation.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lock className="w-8 h-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-800">Session Fixation Checker</h1>
          </div>
          <p className="text-gray-600 text-lg">Deep static checks + exports (JSON/CSV/PDF)</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* upload */}
          <div className="mb-6">
            <label className="flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 w-fit">
              <Upload className="w-5 h-5" />
              <span className="font-medium">Upload Code File</span>
              <input
                type="file"
                accept=".js,.jsx,.ts,.tsx,.php,.py,.java,.cs,.rb,.go,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">Supported: JS/TS, PHP, Python, Java, C#, Ruby, Go, TXT</p>
          </div>

          {/* code input */}
          <form onSubmit={handleLookup}>
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                <FileText className="w-5 h-5 inline mr-2 text-green-600" />
                Server-Side Code
              </label>
              <textarea
                rows={14}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your login/session code…"
                className="w-full border-2 border-gray-200 rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            {/* analyze */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all flex items-center justify-center gap-2 ${
                loading ? 'bg-gray-400' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing…
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" /> Analyze
                </>
              )}
            </button>
          </form>

          {/* downloads */}
          {report && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openExport('json')}
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download JSON
              </button>
              <button
                onClick={() => openExport('csv')}
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download CSV
              </button>
              <button onClick={downloadPDF} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center gap-2">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          )}

          {/* results */}
          {report !== null && (
            <div ref={reportRef} className="mt-8 space-y-6">
              {(summary || metrics) && (
                <div className="rounded-xl border p-4 bg-gray-50">
                  {summary && (
                    <div className="mb-3 text-sm text-gray-800">
                      <strong>Overall:</strong> {summary.overallRisk} • Findings: {summary.totalFindings} (C:
                      {summary.critical} H:{summary.high} M:{summary.medium} L:{summary.low})
                    </div>
                  )}
                  {comparison && (
                    <div className="mb-3 text-xs text-gray-600">
                      {comparison.previousReportId
                        ? `Compared to prev: Δ${comparison.deltaFindings >= 0 ? '+' : ''}${comparison.deltaFindings}`
                        : 'No previous report with same code hash'}
                    </div>
                  )}
                  {metrics && (
                    <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-700">
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
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Security Analysis Report ({report.length} issues)
                    </h2>
                  </div>
                  {report.map((f, i) => (
                    <div key={i} className="border rounded-xl p-6 bg-white shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getSeverityIcon(f.severity)}
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${badge(f.severity)}`}>
                            {(f.severity || '').toUpperCase()} • CVSS {f.cvss ?? '—'} • {f.exploitability || '—'} exploitability
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">Rule: {f.rule || '—'}</span>
                      </div>
                      <p className="text-gray-800 mb-2">
                        <strong>Issue:</strong> {f.message}
                      </p>
                      {f.reasoning && (
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Reasoning:</strong> {f.reasoning}
                        </p>
                      )}
                      {f.attackScenario && (
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Attack:</strong> {f.attackScenario}
                        </p>
                      )}
                      {Array.isArray(f.locations) && f.locations.length > 0 && (
                        <div className="mt-3 text-xs">
                          <p className="font-semibold text-gray-800 mb-1">Locations:</p>
                          <ul className="list-disc ml-5 space-y-1">
                            {f.locations.slice(0, 5).map((loc, k) => (
                              <li key={k}>
                                <code>Line {loc.line}</code> — <span className="text-gray-600">{loc.snippet}</span>
                              </li>
                            ))}
                          </ul>
                          {f.locations.length > 5 && <p className="text-gray-500 mt-1">+ {f.locations.length - 5} more…</p>}
                        </div>
                      )}
                      {f.suggestion && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                          <p className="font-semibold text-green-800 mb-1">Recommended Fix</p>
                          <p className="text-sm text-green-700">{f.suggestion}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-16">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h2 className="text-2xl font-semibold text-green-700 mb-2">All Clear</h2>
                  <p className="text-gray-600 text-lg">No session fixation vulnerabilities detected</p>
                </div>
              )}
            </div>
          )}

          {report === null && !loading && (
            <div className="text-center py-16 text-gray-500 mt-8">
              <Lock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Ready to analyze your code</p>
              <p className="text-sm mt-2">Paste server-side code and click “Analyze”</p>
            </div>
          )}
        </div>

        {/* best practices */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" /> Session Security Best Practices
          </h3>
          <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-700 list-disc ml-5">
            <li>Regenerate session ID after login and privilege escalation.</li>
            <li>Use HttpOnly, Secure, SameSite cookies; set maxAge and rolling policy.</li>
            <li>Strong entropy for tokens; avoid Math.random/Date.now.</li>
            <li>Validate session on every request; bind to IP/UA where appropriate.</li>
            <li>Force HTTPS + HSTS; avoid mixed content.</li>
            <li>Invalidate session on logout server-side; enforce MFA for sensitive flows.</li>
          </ul>
        </div>

        <div className="text-center text-gray-600 text-sm mt-8">
          <p>🔒 Report exports: JSON/CSV (server) • PDF (client)</p>
        </div>
      </div>
    </div>
  );
}
