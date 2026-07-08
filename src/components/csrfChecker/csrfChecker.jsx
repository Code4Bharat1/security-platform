"use client";

import { useState } from "react";
import {
  Shield,
  Upload,
  CheckCircle,
  AlertTriangle,
  X,
  Terminal,
  Globe,
  Info,
  Activity,
  Layers,
  Cpu,
  ShieldAlert
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

export default function CSRFChecker() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const protectedAction = useProtectedAction();
  const API_BASE = process.env.NEXT_PUBLIC_PROD_API_URL;

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      5000
    );
  };

  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const handleAnalyze = async () => {
    if (!code.trim()) {
      addToast("Please enter some code to analyze", "error");
      return;
    }

    setLoading(true);
    setResult(null);

    await protectedAction(async (token) => {
      try {
        const endpoint = `${
          API_BASE ? API_BASE.replace(/\/$/, "") : ""
        }/csrf/csrf-check`;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to analyze code");
        }

        const data = await res.json();
        setResult(data);

        addToast(
          data.vulnerable
            ? "CSRF vulnerabilities detected! Check the results below."
            : "Great! No critical CSRF issues found.",
          data.vulnerable ? "warning" : "success"
        );
      } catch (err) {
        addToast(`Analysis failed: ${err.message}`, "error");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.match(/\.(html|js|jsx|ts|tsx)$/i)) {
      addToast(
        "Please upload a valid code file (.html, .js, .jsx, .ts, .tsx)",
        "error"
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCode(ev.target.result);
      addToast(`File "${file.name}" loaded successfully`, "success");
    };
    reader.onerror = () => addToast("Failed to read file", "error");
    reader.readAsText(file);
  };

  const getToastIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-red-400" />;
      case "error":
        return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      default:
        return <Shield className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getToastBg = (type) => {
    switch (type) {
      case "success":
        return "bg-zinc-950/90 border-zinc-800 text-zinc-200";
      case "error":
        return "bg-zinc-950/90 border-red-900/50 text-red-400";
      case "warning":
        return "bg-zinc-950/90 border-orange-900/50 text-orange-400";
      default:
        return "bg-zinc-950/90 border-zinc-800 text-zinc-200";
    }
  };

  return (
    <div 
      className="tool-detail-page min-h-screen"
      style={{
        '--hero-ambient-a': 'rgba(239, 68, 68, 0.08)',
        '--hero-ambient-b': 'rgba(249, 115, 22, 0.03)',
        '--glow-primary': '0 0 34px rgba(239, 68, 68, 0.16)',
        '--gold': '#ef4444',
        '--gold-strong': '#f87171',
        '--gold-dark': '#b91c1c',
        '--ring': 'rgba(239, 68, 68, 0.34)',
        '--surface-glow': 'rgba(239, 68, 68, 0.14)',
      }}
    >
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.35) !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(239, 68, 68, 0.22) !important;
          color: #fef2f2 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-red-"], [class*="bg-rose-"]) {
          color: #000000 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-red-"], [class*="bg-rose-"]) * {
          color: #000000 !important;
        }
      `}</style>

      {/* Toast Overlay */}
      <div className="fixed top-4 right-4 z-50 space-y-2 font-mono text-xs">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${getToastBg(
              toast.type
            )} border rounded-xl p-4 shadow-xl backdrop-blur-md max-w-sm animate-in slide-in-from-right duration-300`}
          >
            <div className="flex items-start gap-3">
              {getToastIcon(toast.type)}
              <p className="flex-1 text-zinc-300 leading-normal">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="tool-detail-shell">
        {/* Navigation Top Badge */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-red-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-red-400">
            Red Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-red-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              CSRF <span className="text-red-400">ANALYZER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Validate frontend code repositories for Cross-Site Request Forgery weaknesses. Audits form submission token headers and SameSite cookie configurations.
            </p>
          </div>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Input Form Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-red-500/10 transition-all duration-300 space-y-4">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-2 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-red-400" />
                CSRF Code Analysis
              </h2>

              <div className="space-y-4">
                <textarea
                  className="w-full h-64 p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200 font-mono text-xs text-zinc-300 placeholder:text-zinc-650"
                  placeholder="Paste HTML, JavaScript middleware, or frontend form elements here..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept=".html,.js,.jsx,.ts,.tsx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 px-4 py-4 bg-zinc-900/40 hover:bg-red-500/5 text-zinc-350 hover:text-red-400 border border-zinc-800/80 hover:border-red-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300">
                      <Upload className="w-4 h-4" />
                      <span>Upload Code File</span>
                    </div>
                  </label>

                  <button
                    onClick={handleAnalyze}
                    disabled={loading || !code.trim()}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] focus:outline-none disabled:opacity-40"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Analyzing signatures...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 text-black" />
                        Analyze Code
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Block */}
            {result && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-6">
                
                <h3 className="text-sm font-mono font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-850 pb-2.5">
                  <Activity className="w-4 h-4 text-red-400" />
                  Security Analysis Outcome
                </h3>

                {/* Score breakdown metrics */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl p-4 border border-zinc-850 bg-zinc-900/40 font-mono text-xs">
                    <span className="text-[10px] text-zinc-550 block mb-1">Security Score</span>
                    <span
                      className={`text-2xl font-extrabold block ${
                        result.score >= 80
                          ? "text-zinc-200"
                          : result.score >= 50
                          ? "text-orange-450"
                          : "text-red-400 font-bold"
                      }`}
                    >
                      {result.score} / 100
                    </span>
                    <div className="mt-1 text-[10px] text-zinc-500 uppercase tracking-wide">
                      Risk Rating: <span className="font-bold text-zinc-350">{result.riskLevel}</span>
                    </div>
                  </div>

                  <div className="rounded-xl p-4 border border-zinc-850 bg-zinc-900/40 font-mono text-xs">
                    <span className="text-[10px] text-zinc-550 block mb-2">Checks Breakdown</span>
                    <ul className="space-y-1.5 pl-0 list-none text-[11px] text-zinc-450">
                      <li className="flex items-center gap-2">
                        <span>{result.breakdown?.tokenPresentOK ? "✔" : "✖"}</span>
                        <span>Token Present (+30)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>{result.breakdown?.cookieSameSiteOK ? "✔" : "✖"}</span>
                        <span>Cookie SameSite (+30)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>{result.breakdown?.originRefererOK ? "✔" : "✖"}</span>
                        <span>Origin/Referrer Check (+30)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>{result.breakdown?.tokenRandomnessOK ? "✔" : "✖"}</span>
                        <span>Token Entropy (+10)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Vulnerability Warning card */}
                <div
                  className={`rounded-xl p-4 border font-mono text-xs space-y-3 ${
                    result.vulnerable
                      ? "bg-red-955/10 border-red-500/20 text-red-400"
                      : "bg-zinc-900/40 border-zinc-800/80 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-bold uppercase tracking-wider">
                    {result.vulnerable ? (
                      <>
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Vulnerabilities Detected
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 text-red-450" />
                        Validated Secure Code
                      </>
                    )}
                  </div>

                  {result.issues?.length > 0 && (
                    <div className="space-y-2 border-t border-red-500/10 pt-3 mt-1">
                      <h4 className="text-[10px] text-zinc-500 uppercase tracking-wide font-bold">Identified Flaws</h4>
                      <ul className="space-y-2 pl-0 list-none text-zinc-400">
                        {result.issues.map((issue, idx) => (
                          <li key={idx} className="flex items-start gap-2 leading-relaxed">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-2 border-t border-zinc-800/60 pt-3">
                    <h4 className="text-[10px] text-zinc-550 uppercase tracking-wide font-bold">Remediation Steps</h4>
                    <ul className="space-y-2 pl-0 list-none text-zinc-400">
                      <li className="flex items-start gap-2 leading-relaxed">
                        <CheckCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>Enforce anti-CSRF token verification parameters in all POST, PUT, and DELETE actions.</span>
                      </li>
                      <li className="flex items-start gap-2 leading-relaxed">
                        <CheckCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>Set <code className="bg-zinc-950 px-1 rounded text-red-400">SameSite=Strict</code> cookies.</span>
                      </li>
                      <li className="flex items-start gap-2 leading-relaxed">
                        <CheckCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>Validate Origin and Referer header origins server-side.</span>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Right Column (Guidance) */}
          <div className="space-y-6">
            
            {/* Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-red-400 w-4 h-4" />
                Analyzer Guidance
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Scans code for references to state-changing forms missing validation checks.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Audits session cookie parameters (HttpOnly, Secure, SameSite setup).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Validates server-side logic checking Origin and Referer parameter states.
                  </span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
