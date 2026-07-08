'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import useProtectedAction from '../UseProtectedAction/UseProtectedAction';
import {
  Terminal,
  Globe,
  Search,
  Loader2,
  ShieldAlert,
  Info,
  Activity,
  Layers,
  Cpu,
  Server,
  Download,
  ExternalLink,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

export default function DirectoryBruteForcer() {
  const protectedAction = useProtectedAction();
  const [target, setTarget] = useState('');
  const [recursive, setRecursive] = useState(true);
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const startScan = async () => {
    await protectedAction(async (token) => {
      const cleanTarget = target.trim();
      if (!cleanTarget) return;
      setLoading(true);
      setResults([]);
      setMeta(null);
      setCurrentPage(1);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/bruteForce/brute-Force`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ target: cleanTarget, recursive }),
          }
        );
        const data = await res.json();
        if (res.ok) {
          setResults(Array.isArray(data.results) ? data.results : []);
          setMeta(data.meta || null);
        } else {
          setResults([{ path: '-', status: '-', result: data.error || 'Error' }]);
        }
      } catch (err) {
        console.error('Scan error:', err);
        setResults([{ path: '-', status: '-', result: '⚠️ Scan failed' }]);
      } finally {
        setLoading(false);
      }
    });
  };

  const formatDuration = (ms) => {
    if (ms === 0) return '0 ms';
    if (!ms && ms !== 0) return '-';
    if (ms < 1000) return `${ms} ms`;
    const s = ms / 1000;
    if (s < 60) return `${s.toFixed(2)} s`;
    const m = Math.floor(s / 60);
    const r = (s % 60).toFixed(1);
    return `${m}m ${r}s`;
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Banner
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(239, 68, 68);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("NEXCORE RED TEAM SECURITY AUDIT", 14, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`DIRECTORY BRUTE FORCE AUDIT LOG FOR ${target.toUpperCase()}`, 14, 30);

    autoTable(doc, {
      head: [['Path Hostname', 'HTTP Status', 'Diagnostic Result']],
      body: results.map(({ path, status, result }) => [
        path ?? '-',
        status ?? '-',
        typeof result === 'string' ? result : JSON.stringify(result),
      ]),
      startY: 48,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255] },
    });
    
    doc.save('directory_brute_force_results.pdf');
  };

  const viewFoundSite = (path) => {
    if (!path) return;
    try {
      const isAbsolute = /^https?:\/\//i.test(path);
      let url;
      if (isAbsolute) {
        url = path;
      } else {
        const base = target.trim().replace(/\/+$/, '');
        const p = path.startsWith('/') ? path : `/${path}`;
        url = base ? `${base}${p}` : p;
      }
      window.open(url, '_blank');
    } catch (e) {
      console.error('Failed to open URL', e);
    }
  };

  // Pagination helper calculations
  const totalPages = Math.max(1, Math.ceil(results.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = results.slice(indexOfFirstItem, indexOfLastItem);

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

      <div className="tool-detail-shell">
        {/* Navigation & Header */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-red-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-red-400">
            Red Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-red-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <Terminal className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              BRUTE <span className="text-red-400">FORCER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Perform directory and resource enumeration on target systems to locate exposed files, admin portals, and hidden directories.
            </p>
          </div>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Form Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-red-500/10 transition-all duration-300 space-y-4">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-2 flex items-center gap-2">
                <Globe className="h-5 w-5 text-red-400" />
                Target Recon Profile
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Target URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 pl-12 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:shadow-[0_0_12px_rgba(239,68,68,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 py-2 border-b border-zinc-900 pb-4">
                  <span className="text-xs font-mono text-zinc-400">Recursive Directory Sweep</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={recursive}
                      onChange={(e) => setRecursive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-450 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500 peer-checked:after:bg-black peer-checked:after:border-black"></div>
                  </label>
                </div>

                <button
                  onClick={startScan}
                  disabled={loading || !target}
                  className="w-full bg-red-500 hover:bg-red-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] focus:outline-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      Scanning Target Directories...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 text-black" />
                      Start Sweep
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Meta Results Block */}
            {meta && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                <h3 className="text-sm font-mono font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-850 pb-2.5 mb-4">
                  <Activity className="w-4 h-4 text-red-400" />
                  Scan Telemetry Metrics
                </h3>
                <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-3 rounded-xl">
                    <span className="text-[10px] text-zinc-550 block mb-1">Recursive</span>
                    <span className="text-zinc-200 font-bold">{meta.recursive ? 'Active' : 'No'}</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-3 rounded-xl">
                    <span className="text-[10px] text-zinc-550 block mb-1">Queries Sent</span>
                    <span className="text-zinc-200 font-bold">{meta.totalRequests ?? '-'}</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-3 rounded-xl">
                    <span className="text-[10px] text-zinc-550 block mb-1">Duration</span>
                    <span className="text-zinc-200 font-bold">{formatDuration(meta.durationMs)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Results Listings */}
            {results.length > 0 ? (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-4">
                
                {/* Download PDF & Filter Action */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-4">
                  <div>
                    <h3 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
                      Discovery Logs
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-550">
                      Enumerated files and path list
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={downloadPDF}
                      className="px-4 py-2.5 bg-zinc-900/40 hover:bg-red-500/5 text-zinc-300 hover:text-red-400 border border-zinc-800/80 hover:border-red-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </button>

                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                      <span>Show</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="bg-zinc-900 border border-zinc-800/80 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-red-500/35 cursor-pointer"
                      >
                        {[10, 15, 25, 50, 100].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Table list */}
                <div className="overflow-x-auto border border-zinc-800/80 rounded-xl bg-zinc-900/10">
                  <table className="w-full text-xs divide-y divide-zinc-800 table-auto font-mono text-zinc-350">
                    <thead className="bg-zinc-950/40 text-zinc-400 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Path</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                        <th className="px-4 py-3 text-left font-semibold">Result</th>
                        <th className="px-4 py-3 text-left font-semibold">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 bg-transparent">
                      {currentItems.map((item, i) => {
                        const isSuccess = item.status === 200 || item.status === '200';
                        return (
                          <tr key={i} className="hover:bg-zinc-900/20 transition-colors">
                            <td className="px-4 py-3 text-zinc-150 font-semibold break-all">
                              {item.path ?? '-'}
                            </td>
                            <td className="px-4 py-3 font-semibold">
                              <span className={isSuccess ? "text-red-400" : "text-zinc-500"}>
                                {item.status ?? '-'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-zinc-450 break-words">
                              {typeof item.result === 'string' ? item.result : JSON.stringify(item.result)}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => viewFoundSite(item.path)}
                                className="text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 font-semibold"
                              >
                                View
                                <ExternalLink size={10} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 px-1 font-mono text-xs">
                    <div className="text-zinc-500">
                      Showing <span className="font-semibold text-zinc-300">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-semibold text-zinc-300">
                        {Math.min(indexOfLastItem, results.length)}
                      </span>{' '}
                      of <span className="font-semibold text-zinc-300">{results.length}</span> entries
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="bg-zinc-900/60 hover:bg-zinc-850 disabled:opacity-40 text-zinc-300 px-3 py-1.5 rounded border border-zinc-800/80 cursor-pointer disabled:cursor-not-allowed text-[11px]"
                      >
                        Prev
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                        let pageNum = idx + 1;
                        if (totalPages > 5) {
                          if (currentPage > 3) {
                            pageNum = currentPage - 3 + idx;
                            if (pageNum + (5 - idx - 1) > totalPages) {
                              pageNum = totalPages - 5 + idx + 1;
                            }
                          }
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1.5 rounded transition-colors border text-[11px] cursor-pointer ${
                              currentPage === pageNum
                                ? 'bg-red-500 border-red-500 text-black font-bold'
                                : 'bg-zinc-900/60 hover:bg-zinc-800 border-zinc-800/80 text-zinc-400 hover:text-zinc-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="bg-zinc-900/60 hover:bg-zinc-850 disabled:opacity-40 text-zinc-300 px-3 py-1.5 rounded border border-zinc-800/80 cursor-pointer disabled:cursor-not-allowed text-[11px]"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 text-center py-16 text-zinc-550 font-mono text-xs">
                No active scan sweep results available. Launch scan to populate targets table.
              </div>
            )}

          </div>

          {/* Right Column (Specs & Guidance) */}
          <div className="space-y-6">
            
            {/* Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-red-400 w-4 h-4" />
                Sweep guidance
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Scans locate hidden folders, backups, and configurations using custom dictionaries.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Toggles enable recursive directory searches to discover nested assets.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Findings filter active paths to identify points of interest for audits.
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
