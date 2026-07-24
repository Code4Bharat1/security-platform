"use client";

import { useState } from "react";
import {
  Mail,
  ShieldCheck,
  ShieldAlert,
  Download,
  Loader2,
  AlertCircle,
  FileText,
  Globe,
  CheckCircle2,
  XCircle,
  Upload,
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import { generateEmailPDF } from "./generateEmailPDF";

export default function EmailAttachmentAnalyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const protectedAction = useProtectedAction();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
      setError("");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);
    setError("");
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    await protectedAction(async (userToken) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/email-attachment`,
          {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Failed to analyze the file.");
        }

        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError(err.message || "Server error while scanning.");
      } finally {
        setLoading(false);
      }
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/25 bg-transparent";
    if (score >= 50) return "text-orange-400 border-orange-500/25 bg-transparent";
    return "text-rose-400 border-rose-500/25 bg-transparent";
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = 1;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const getSeverityBadge = (sev) => {
    if (sev === "Critical" || sev === "High") return "bg-rose-950/20 text-rose-400 border-rose-500/25";
    if (sev === "Medium" || sev === "Low") return "bg-orange-950/20 text-orange-400 border-orange-500/25";
    return "bg-emerald-950/20 text-emerald-400 border-emerald-500/25";
  };

  const getStatusBadge = (status) => {
    if (status === "Failed" || status === "Warning") return "bg-rose-950/20 text-rose-400 border-rose-500/25";
    return "bg-emerald-950/20 text-emerald-400 border-emerald-500/25";
  };

  return (
    <div className="tool-detail-page min-h-screen" style={{
      "--hero-ambient-a": "rgba(16, 185, 129, 0.08)",
      "--hero-ambient-b": "rgba(16, 185, 129, 0.03)",
      "--glow-primary": "0 0 34px rgba(16, 185, 129, 0.16)",
      "--gold": "#10b981",
      "--gold-strong": "#34d399",
      "--gold-dark": "#047857",
      "--ring": "rgba(16, 185, 129, 0.34)",
      "--surface-glow": "rgba(16, 185, 129, 0.14)",
    }}>
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.35) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(16, 185, 129, 0.22) !important;
          color: #e6fffa !important;
        }
        .tool-detail-page .tool-detail-panel {
          background:
            radial-gradient(circle at center, rgba(16, 185, 129, 0.04), transparent 55%),
            linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)) !important;
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.01),
            0 0 40px rgba(16, 185, 129, 0.04) !important;
          border-color: rgba(16, 185, 129, 0.12) !important;
        }
      `}</style>

      <div className="tool-detail-shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-emerald-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-emerald-400">
            Green Team
          </span>
        </div>

        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <Mail className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              EMAIL PHISHING <span className="text-emerald-400">& THREAT ANALYZER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-3xl text-base font-normal">
              Upload email attachment files or complete EML email messages to scan for potential threats, scripts, macros, and reputation risks.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            {/* Upload Area */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <Upload className="h-5 w-5 text-emerald-400" />
                Upload File or Email
              </h2>

              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${
                  dragActive
                    ? "border-emerald-500 bg-emerald-500/5"
                    : "border-zinc-800 bg-zinc-900/10 hover:border-zinc-700"
                }`}
              >
                <FileText className={`h-12 w-12 mb-4 ${dragActive ? "text-emerald-400" : "text-zinc-600"}`} />
                <p className="text-sm text-zinc-300 font-mono text-center">
                  Drag and drop your attachment file or <span className="text-emerald-400">.eml</span> here
                </p>
                <span className="text-xs text-zinc-600 my-2">OR</span>
                <label className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-850 hover:border-zinc-750 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-all">
                  Browse Files
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {file && (
                <div className="mt-5 p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-emerald-400" />
                    <div>
                      <p className="text-xs font-mono font-bold text-zinc-300 truncate max-w-md">{file.name}</p>
                      <p className="text-[10px] font-mono text-zinc-600 mt-0.5">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      setResult(null);
                      setError("");
                    }}
                    className="text-zinc-500 hover:text-rose-400 text-xs font-mono font-bold uppercase cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 rounded-xl border border-rose-500/25 bg-rose-500/5 text-rose-400 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider block mb-1">Scan Error</span>
                    <span className="text-xs text-rose-300 block">{error}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading || !file}
                className="w-full mt-5 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:outline-none disabled:opacity-40 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing Attachment File...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Analyze Attachment File
                  </>
                )}
              </button>
            </div>

            {/* Results Display Panel */}
            {result && !loading && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_12px_40px_rgb(0,0,0,0.2)] space-y-6 hover:border-emerald-500/10 transition-all duration-300">
                <div className="border-b border-zinc-800/50 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <span className="font-mono font-bold text-sm uppercase tracking-wider text-emerald-400">
                      Inspection Result
                    </span>
                  </div>
                  <button
                    onClick={() => generateEmailPDF(result, file?.name)}
                    className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-3.5 py-1.5 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none self-start sm:self-auto"
                  >
                    <Download size={14} /> PDF Report
                  </button>
                </div>

                {/* Score Section */}
                <div className={`border rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 ${getScoreColor(result.overallScore)}`}>
                  <div>
                    <h3 className="text-xs uppercase tracking-widest font-mono text-zinc-400 mb-1">
                      File Safety Trust Score
                    </h3>
                    <p className="text-sm text-zinc-300 font-mono">
                      {result.message}
                    </p>
                  </div>
                  <div className="text-3xl font-mono font-bold">
                    {result.overallScore} <span className="text-xs font-normal text-zinc-500">/ 100</span>
                  </div>
                </div>

                {/* EML Mode Results */}
                {result.isEml ? (
                  <div className="space-y-6">
                    {/* Headers */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <Mail size={14} className="text-emerald-400" />
                        Email Envelope Headers
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          ["Subject", result.subject],
                          ["Sender (From)", result.from],
                          ["Recipient (To)", result.to],
                        ].map(([label, val]) => (
                          <div key={label} className="bg-zinc-900/30 rounded-xl p-3.5 border border-zinc-800/50 sm:last:col-span-2">
                            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">{label}</div>
                            <div className="text-xs text-zinc-300 font-mono break-all">{val || "—"}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Authentication */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        Domain Authentication
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">SPF Check</div>
                            <span className="text-xs font-mono font-bold text-zinc-300">{result.spfStatus.toUpperCase()}</span>
                          </div>
                          {result.spfStatus === "pass" ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-rose-400" />
                          )}
                        </div>

                        <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">DKIM Sign Verification</div>
                            <span className="text-xs font-mono font-bold text-zinc-300">{result.dkimStatus.toUpperCase()}</span>
                          </div>
                          {result.dkimStatus === "pass" ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-rose-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <Globe size={14} className="text-emerald-400" />
                        Hyperlinks Scan ({result.extractedLinks?.length ?? 0})
                      </h3>
                      {result.extractedLinks && result.extractedLinks.length > 0 ? (
                        <div className="bg-zinc-900/30 rounded-xl border border-zinc-800/50 overflow-hidden divide-y divide-zinc-800/50">
                          {result.extractedLinks.map((link, i) => (
                            <div key={i} className="p-3.5 flex items-center justify-between gap-4 text-xs font-mono">
                              <span className="text-zinc-300 truncate max-w-lg">{link.url}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                link.isSuspicious 
                                  ? "bg-rose-950/20 text-rose-400 border-rose-500/25"
                                  : "bg-emerald-950/20 text-emerald-400 border-emerald-500/25"
                              }`}>
                                {link.isSuspicious ? "Suspicious" : "Clean"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-zinc-900/10 rounded-xl p-4 border border-zinc-850 text-center text-xs font-mono text-zinc-500">
                          No links extracted.
                        </div>
                      )}
                    </div>

                    {/* Attachments */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <FileText size={14} className="text-emerald-400" />
                        Extracted Email Attachments ({result.attachments?.length ?? 0})
                      </h3>
                      {result.attachments && result.attachments.length > 0 ? (
                        <div className="bg-zinc-900/30 rounded-xl border border-zinc-800/50 overflow-hidden divide-y divide-zinc-800/50">
                          {result.attachments.map((att, i) => (
                            <div key={i} className="p-3.5 space-y-2 text-xs font-mono">
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-200 font-bold">{att.filename}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                  att.isDangerous 
                                    ? "bg-rose-950/20 text-rose-400 border-rose-500/25"
                                    : "bg-emerald-950/20 text-emerald-400 border-emerald-500/25"
                                }`}>
                                  {att.isDangerous ? "Dangerous Extension" : "Verified"}
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-zinc-500 gap-1">
                                <span>MD5: {att.hash}</span>
                                <span>Size: {formatSize(att.size)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-zinc-900/10 rounded-xl p-4 border border-zinc-850 text-center text-xs font-mono text-zinc-500">
                          No email attachments extracted.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Direct File Mode Results */
                  <div className="space-y-4 font-mono text-xs">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 pb-2">
                      <FileText size={14} className="text-emerald-400" />
                      Detailed Findings – Email Attachment Analysis
                    </h3>
                    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl overflow-hidden divide-y divide-zinc-850">
                      {[
                        ["Attachment Name", result.attachmentName],
                        ["File Type", result.fileType],
                        ["File Size", result.fileSize],
                        ["Severity", result.severity, getSeverityBadge(result.severity)],
                        ["Status", result.status, getStatusBadge(result.status)],
                        ["Malware Detected", result.malwareDetected],
                        ["Macro Detected", result.macroDetected],
                        ["Embedded Scripts", result.embeddedScripts],
                        ["Risk Level", result.riskLevel, getSeverityBadge(result.riskLevel)],
                        ["Issue Detected", result.issueDetected],
                        ["Impact", result.impact],
                        ["Recommendation", result.recommendation],
                      ].map(([label, val, badgeClass]) => (
                        <div key={label} className="p-3.5 grid sm:grid-cols-[160px_1fr] gap-2 items-center">
                          <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">{label}</span>
                          {badgeClass ? (
                            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold self-start sm:self-auto w-max ${badgeClass}`}>
                              {val}
                            </span>
                          ) : (
                            <span className="text-zinc-300 break-all leading-relaxed">{val}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-emerald-400" />
                Auditor Audit Scope
              </h4>
              <ul className="space-y-3.5 list-none pl-0">
                {[
                  "Analyzes standalone attachment files for embedded script threats.",
                  "Identifies OLE macro constructs in office documents.",
                  "Computes static MD5 hashes for upload logs.",
                  "Supports standard EML parsing checking authentication parameters.",
                  "Validates DKIM signatures and SPF routing lists.",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-zinc-400 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
