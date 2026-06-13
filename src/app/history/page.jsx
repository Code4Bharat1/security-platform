"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Download, 
  Trash2, 
  Calendar, 
  RefreshCw, 
  ArrowUpDown, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  Eye,
  X
} from "lucide-react";
import ProtectedWrapper from "@/components/ProtectedWrapper";
import SectionIntro from "@/components/marketing/SectionIntro";

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [fileType, setFileType] = useState("");
  const [date, setDate] = useState("");
  
  // Sorting & Pagination State
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });

  // Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showRawDetails, setShowRawDetails] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        search,
        fileType,
        date
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/history?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch history.");
      }

      setRecords(data.data.records || []);
      setPagination(data.data.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
    } catch (err) {
      console.error("Fetch history error:", err);
      setError(err.message || "Something went wrong while loading history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, sortBy, sortOrder, fileType, date]);

  // Trigger search filter
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setFileType("");
    setDate("");
    setPage(1);
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  // Handle Sort Change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  // Download file via Blob to pass authorization headers
  const handleDownload = async (recordId, fileIndex, fileName) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/history/download/${recordId}/${fileIndex}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to download file.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Could not download file.");
    }
  };

  // Delete history entry
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/history/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete record.");
      }

      setSuccessMsg("History record deleted successfully.");
      setDeleteConfirmId(null);
      setTimeout(() => setSuccessMsg(""), 3000);
      
      // Reload page records
      if (records.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchHistory();
      }
    } catch (err) {
      setError(err.message || "Error deleting history record.");
      setDeleteConfirmId(null);
    }
  };

  // Helper to format any scan detail details in HTML
  const renderDetailData = (details) => {
    if (!details) return <p className="text-white/40 italic">No additional report details logged.</p>;

    const hasFormattedText = !!(details.rawReport || details.message);

    if (showRawDetails || !hasFormattedText) {
      return (
        <pre className="text-[11px] font-mono p-4 bg-black/60 border border-white/6 rounded-lg text-emerald-400 max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed">
          {JSON.stringify(details, null, 2)}
        </pre>
      );
    }

    return (
      <div className="space-y-4">
        {details.rawReport ? (
          <pre className="text-[11px] font-mono p-4 bg-black/60 border border-white/6 rounded-lg text-emerald-400 max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {details.rawReport}
          </pre>
        ) : (
          <div className="space-y-3">
            {details.message && <p className="text-sm font-medium text-white/90 leading-relaxed">{details.message}</p>}
            {details.data && (
              <pre className="text-[11px] font-mono p-4 bg-black/40 border border-white/6 rounded-lg text-white/70 max-h-56 overflow-y-auto whitespace-pre-wrap">
                {typeof details.data === 'string' ? details.data : JSON.stringify(details.data, null, 2)}
              </pre>
            )}
            {/* If streaming SSE results compiled arrays */}
            {details.results && Array.isArray(details.results) && (
              <div className="space-y-2 border-t border-white/6 pt-3">
                <h5 className="font-mono text-xs uppercase tracking-wider text-white/50">Captured Findings ({details.results.length})</h5>
                <div className="max-h-48 overflow-y-auto border border-white/6 rounded-lg divide-y divide-white/4 bg-black/20 text-xs">
                  {details.results.map((item, idx) => (
                    <div key={idx} className="p-2.5 font-mono text-white/60">
                      {item.url && <div className="text-[var(--gold)] truncate">{item.url}</div>}
                      {item.statusText && <div className="text-white/40 text-[10px] mt-0.5">Status: {item.status} ({item.statusText})</div>}
                      {item.message && <div className="text-white/80">{item.message}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <ProtectedWrapper>
      <main className="site-page-shell bg-[#050505] text-white min-h-screen">
        <section className="border-b border-white/6 pb-20">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <SectionIntro
              eyebrow="Activity Center"
              title="Execution History"
              description="Review and view detailed scan reports, plus download actual files generated by previously run tools."
              className="mb-12"
            />

            {/* Notification Messages */}
            {successMsg && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-300">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-rose-300">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Filters Dashboard */}
            <div className="glow-panel mb-8 p-6">
              <form onSubmit={handleSearchSubmit} className="grid gap-4 md:grid-cols-12 items-end">
                {/* Search query input */}
                <div className="md:col-span-4 space-y-2">
                  <label className="block font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/40">
                    Search Activity
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Tool Name, Tested Target..."
                      className="contact-input pl-10"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  </div>
                </div>

                {/* File Type selector */}
                <div className="md:col-span-3 space-y-2">
                  <label className="block font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/40">
                    File Format
                  </label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="contact-input bg-[#0d0d0d]"
                  >
                    <option value="">All Formats</option>
                    <option value="PDF">PDF Reports</option>
                    <option value="TXT">TXT Reports</option>
                    <option value="JSON">JSON Data</option>
                    <option value="CSV">CSV Spreadsheets</option>
                    <option value="PNG">PNG Images</option>
                    <option value="DOCX">DOCX Documents</option>
                  </select>
                </div>

                {/* Date filter */}
                <div className="md:col-span-3 space-y-2">
                  <label className="block font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/40">
                    Execution Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="contact-input pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                  </div>
                </div>

                {/* Filter Controls buttons */}
                <div className="md:col-span-2 flex gap-2 w-full">
                  <button
                    type="submit"
                    className="gold-button flex-1 justify-center py-3"
                    disabled={loading}
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex h-[2.85rem] w-12 items-center justify-center border border-white/10 bg-[#0d0d0d] text-white/60 transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
                    title="Reset filters"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </form>
            </div>

            {/* History Records Listing */}
            <div className="glow-panel overflow-hidden">
              <div className="min-w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/6 bg-[#0a0a0a] text-[0.68rem] font-mono uppercase tracking-[0.2em] text-white/40">
                      <th 
                        onClick={() => handleSort("toolName")} 
                        className="cursor-pointer px-6 py-5 select-none hover:text-white transition"
                      >
                        <div className="flex items-center gap-2">
                          Tool Name
                          <ArrowUpDown className="h-3.5 w-3.5" />
                        </div>
                      </th>
                      <th className="px-6 py-5">Tested Target / Input</th>
                      <th 
                        onClick={() => handleSort("createdAt")} 
                        className="cursor-pointer px-6 py-5 select-none hover:text-white transition"
                      >
                        <div className="flex items-center gap-2">
                          Date & Time
                          <ArrowUpDown className="h-3.5 w-3.5" />
                        </div>
                      </th>
                      <th className="px-6 py-5 text-center">Status</th>
                      <th className="px-6 py-5">Actual Generated Files</th>
                      <th className="px-6 py-5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/4">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-20 text-white/40 font-mono text-sm">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3 text-[var(--gold)]" />
                          Querying assessment index...
                        </td>
                      </tr>
                    ) : records.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-20 text-white/30 text-sm">
                          <FileText className="h-10 w-10 mx-auto mb-4 text-white/10" />
                          No execution records found. Run a tool to begin saving history.
                        </td>
                      </tr>
                    ) : (
                      records.map((record) => (
                        <tr key={record._id} className="hover:bg-white/[0.01] transition text-sm">
                          {/* Tool Name */}
                          <td className="px-6 py-4 font-mono text-[var(--gold)] font-bold">
                            {record.toolName}
                          </td>

                          {/* Tested Target */}
                          <td className="px-6 py-4 max-w-[200px] truncate text-white/80" title={record.target}>
                            {record.target}
                          </td>

                          {/* Date & Time */}
                          <td className="px-6 py-4 text-white/50 text-xs">
                            {new Date(record.createdAt).toLocaleString()}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              {record.status}
                            </span>
                          </td>

                          {/* Actual Generated Files */}
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {record.files && record.files.length > 0 ? (
                                record.files.map((file, idx) => {
                                  const isAvail = file.status === "Available";
                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => isAvail && handleDownload(record._id, idx, file.fileName)}
                                      disabled={!isAvail}
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border transition ${
                                        isAvail
                                          ? "border-white/10 bg-[#0d0d0d] text-white/80 hover:border-[var(--gold)] hover:text-[var(--gold)]"
                                          : "border-rose-500/20 bg-rose-500/5 text-rose-400/50 cursor-not-allowed line-through"
                                      }`}
                                      title={isAvail ? `Download ${file.fileName}` : "File has been deleted from disk"}
                                    >
                                      <Download className="h-3 w-3" />
                                      <span>{file.fileType}</span>
                                      {!isAvail && <span className="text-[9px] uppercase tracking-wider text-rose-500/80">(Deleted)</span>}
                                    </button>
                                  );
                                })
                              ) : (
                                <span className="text-white/20 italic text-xs">No files generated</span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setShowRawDetails(false);
                                }}
                                className="text-white/40 hover:text-[var(--gold)] p-2 transition cursor-pointer"
                                title="View report details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(record._id)}
                                className="text-white/40 hover:text-rose-400 p-2 transition cursor-pointer"
                                title="Delete record & files"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-xs font-mono text-white/40">
                  Showing Page {pagination.page} of {pagination.pages} ({pagination.total} records total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="flex h-10 w-10 items-center justify-center border border-white/10 bg-[#0d0d0d] text-white transition hover:border-[var(--gold)] hover:text-[var(--gold)] disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages || loading}
                    className="flex h-10 w-10 items-center justify-center border border-white/10 bg-[#0d0d0d] text-white transition hover:border-[var(--gold)] hover:text-[var(--gold)] disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Modals Container to prevent direct child style override */}
        <div id="history-modals-container">
          {/* View Details Modal */}
          {selectedRecord && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="glow-panel max-w-3xl w-full bg-[#0a0a0a] border border-white/10 p-6 space-y-6 relative my-8">
                {/* Close Button */}
                <button 
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="absolute right-4 top-4 text-white/40 hover:text-white transition p-1 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="border-b border-white/6 pb-4 pr-8">
                  <h3 className="text-xl font-mono text-[var(--gold)] uppercase tracking-wider font-bold">
                    {selectedRecord.toolName}
                  </h3>
                  <p className="text-xs text-white/40 mt-1">
                    Endpoint: {selectedRecord.endpoint}
                  </p>
                </div>

                {/* Metadata details list */}
                <div className="grid gap-4 sm:grid-cols-2 text-xs font-mono">
                  <div className="space-y-1">
                    <span className="text-white/40">Tested Target/Input:</span>
                    <div className="text-white/90 truncate" title={selectedRecord.target}>
                      {selectedRecord.target}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-white/40">Scan Date & Time:</span>
                    <div className="text-white/90">
                      {new Date(selectedRecord.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-white/40">Status:</span>
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        {selectedRecord.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-white/40">Downloadable Files:</span>
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {selectedRecord.files && selectedRecord.files.length > 0 ? (
                        selectedRecord.files.map((file, idx) => {
                          const isAvail = file.status === "Available";
                          return (
                            <button
                              key={idx}
                              onClick={() => isAvail && handleDownload(selectedRecord._id, idx, file.fileName)}
                              disabled={!isAvail}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] border transition ${
                                isAvail
                                  ? "border-white/10 bg-[#0d0d0d] text-white/80 hover:border-[var(--gold)] hover:text-[var(--gold)]"
                                  : "border-rose-500/20 bg-rose-500/5 text-rose-400/50 cursor-not-allowed line-through"
                              }`}
                              title={isAvail ? `Download ${file.fileName}` : "File deleted from disk"}
                            >
                              <Download className="h-2.5 w-2.5" />
                              <span>{file.fileType}</span>
                            </button>
                          );
                        })
                      ) : (
                        <span className="text-white/30 italic text-xs">No generated files</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Scan Results Visualizer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-mono text-xs uppercase tracking-wider text-white/50">Scan Output Details</h4>
                    {selectedRecord.details && (selectedRecord.details.rawReport || selectedRecord.details.message) && (
                      <button
                        type="button"
                        onClick={() => setShowRawDetails(!showRawDetails)}
                        className="text-[10px] font-mono border border-white/10 hover:border-[var(--gold)] px-2 py-0.5 text-white/60 hover:text-[var(--gold)] transition cursor-pointer"
                      >
                        {showRawDetails ? "Formatted View" : "Raw JSON View"}
                      </button>
                    )}
                  </div>
                  {renderDetailData(selectedRecord.details)}
                </div>

                {/* Actions footer */}
                <div className="flex justify-end font-mono text-xs pt-4 border-t border-white/6">
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(null)}
                    className="px-4 py-2 border border-white/10 bg-transparent text-white/60 hover:text-white transition cursor-pointer"
                  >
                    Close Detail
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirmId && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
              <div className="glow-panel max-w-md w-full bg-[#0a0a0a] border border-white/10 p-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-mono text-[var(--gold)] uppercase tracking-wider font-bold">
                    Delete Execution Record?
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Are you sure you want to delete this tool run record? This action will permanently remove the record from your dashboard history and delete the files from the assessment servers. This cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3 justify-end font-mono text-sm">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-4 py-2 border border-white/10 bg-transparent text-white/60 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(deleteConfirmId)}
                    className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </ProtectedWrapper>
  );
}
