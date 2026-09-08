"use client";

import { useEffect, useState, useRef } from "react";
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  History,
  TrendingUp,
  Search,
  Shield,
  X,
  Cpu
} from "lucide-react";
import ProtectedWrapper from "@/components/ProtectedWrapper";
import SectionIntro from "@/components/marketing/SectionIntro";
import { useAuth } from "@/context/AuthContext";

export default function CreditsPage() {
  const { user, setUser } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [balanceInfo, setBalanceInfo] = useState({
    available: 0,
    used: 0,
    totalRecharged: 0,
    remaining: 0
  });
  const [historyData, setHistoryData] = useState({
    transactions: [],
    totalPages: 1,
    currentPage: 1,
    totalTransactions: 0
  });

  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Admin recharge & adjustment state
  const [targetSearch, setTargetSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustmentAction, setAdjustmentAction] = useState("upgrade"); // 'upgrade' | 'downgrade'
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentNote, setAdjustmentNote] = useState("");
  const [rechargeLoading, setRechargeLoading] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const searchDebounceRef = useRef(null);

  const fetchBalance = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingBalance(false);
      return;
    }

    setLoadingBalance(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/credits/balance`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/gain-access";
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch balance stats.");
      setBalanceInfo(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Could not retrieve credit balance details.");
    } finally {
      setLoadingBalance(false);
    }
  };

  const fetchHistory = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingHistory(false);
      return;
    }

    setLoadingHistory(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/credits/history?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/gain-access";
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch transaction logs.");
      setHistoryData(data);
    } catch (err) {
      console.warn("Fetch credits history warning:", err.message || err);
      setErrorMsg(err.message || "Could not retrieve credit transaction history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const handleSearchUsers = (text) => {
    setTargetSearch(text);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!text.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      setSearchingUsers(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/credits/search-users?query=${encodeURIComponent(text.trim())}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.users || []);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error("User search error:", err);
      } finally {
        setSearchingUsers(false);
      }
    }, 300);
  };

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setTargetSearch(`${u.name || 'User'} (${u.email})`);
    setShowSearchDropdown(false);
    setErrorMsg("");
  };

  const handleClearSelectedUser = () => {
    setSelectedUser(null);
    setTargetSearch("");
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  const handleRecharge = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!selectedUser) {
      setErrorMsg("Please search and select a target user to adjust credits.");
      return;
    }

    const amountNum = parseInt(adjustmentAmount);
    if (!amountNum || amountNum < 1) {
      setErrorMsg("Please enter a valid credit quantity to adjust (min 1).");
      return;
    }

    if (!adjustmentNote.trim()) {
      setErrorMsg("Please enter a note explaining the reason for this credit adjustment.");
      return;
    }

    setRechargeLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/auth/recharge-credits`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            targetUserId: selectedUser.id,
            amount: amountNum,
            action: adjustmentAction,
            note: adjustmentNote.trim()
          })
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Credit adjustment failed.");
      
      const actionWord = adjustmentAction === 'downgrade' ? 'downgraded' : 'upgraded';
      const updatedCredits = data.newBalance ?? data.user?.credits ?? 0;
      setSuccessMsg(`Successfully ${actionWord} ${amountNum} credits for ${selectedUser.email}! New balance: ${updatedCredits} CR`);
      
      setSelectedUser(prev => prev ? { ...prev, credits: updatedCredits } : null);
      setAdjustmentAmount("");
      setAdjustmentNote("");
      
      const isSelf = user?.id === selectedUser.id || user?._id === selectedUser.id || user?.email === selectedUser.email;
      if (isSelf) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          parsed.credits = updatedCredits;
          localStorage.setItem("user", JSON.stringify(parsed));
        }
        if (setUser) {
          setUser(prev => prev ? { ...prev, credits: updatedCredits } : prev);
        }
      }

      await Promise.all([fetchBalance(), fetchHistory()]);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to process credit adjustment.");
    } finally {
      setRechargeLoading(false);
    }
  };

  return (
    <ProtectedWrapper>
      <main className="site-page-shell bg-[#050505] text-white min-h-screen">
        <section className="border-b border-white/6 pb-20">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <SectionIntro
              eyebrow="Billing System"
              title="Credit Management"
              description="Monitor available credits, view transaction history, and manage platform testing units."
              className="mb-12"
            />

            {successMsg && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-300">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-rose-300">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{errorMsg}</span>
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-3 mb-10">
              <div className="glow-panel p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs uppercase tracking-wider text-white/40">Available Balance</span>
                  <Coins className="h-5 w-5 text-[var(--gold)]" />
                </div>
                <div>
                  {loadingBalance ? (
                    <div className="h-9 w-24 bg-white/5 animate-pulse rounded" />
                  ) : (
                    <span className="text-4xl font-mono text-[var(--gold)] font-bold tracking-tight">
                      {balanceInfo.available}
                    </span>
                  )}
                  <p className="text-xs text-white/45 mt-2">Credits ready for active scanner runs</p>
                </div>
              </div>

              <div className="glow-panel p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs uppercase tracking-wider text-white/40">Total Consumed</span>
                  <ArrowDownLeft className="h-5 w-5 text-rose-450" />
                </div>
                <div>
                  {loadingBalance ? (
                    <div className="h-9 w-24 bg-white/5 animate-pulse rounded" />
                  ) : (
                    <span className="text-4xl font-mono text-white/90 font-bold tracking-tight">
                      {balanceInfo.used}
                    </span>
                  )}
                  <p className="text-xs text-white/45 mt-2">Deducted over previous vulnerability checks</p>
                </div>
              </div>

              <div className="glow-panel p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs uppercase tracking-wider text-white/40">Total Recharged</span>
                  <TrendingUp className="h-5 w-5 text-emerald-450" />
                </div>
                <div>
                  {loadingBalance ? (
                    <div className="h-9 w-24 bg-white/5 animate-pulse rounded" />
                  ) : (
                    <span className="text-4xl font-mono text-white/90 font-bold tracking-tight">
                      {balanceInfo.totalRecharged}
                    </span>
                  )}
                  <p className="text-xs text-white/45 mt-2">Credits allocated via billing/upgrades</p>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12 items-start">
              {isAdmin && (
                <div className="glow-panel p-6 lg:col-span-5 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-[var(--gold)]" />
                      <h3 className="text-lg font-mono text-[var(--gold)] uppercase tracking-wider font-bold">
                        Admin Credit Adjustment
                      </h3>
                    </div>
                    <p className="text-xs text-white/50">
                      Search user by Name, Email, or User ID to upgrade or downgrade their platform testing units.
                    </p>
                  </div>

                  <form onSubmit={handleRecharge} className="space-y-5">
                    <div className="space-y-2 relative">
                      <label className="block font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/40">
                        Target User Lookup (Name / Email / User ID)
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                        <input
                          type="text"
                          value={targetSearch}
                          onChange={(e) => handleSearchUsers(e.target.value)}
                          onFocus={() => {
                            if (searchResults.length > 0) setShowSearchDropdown(true);
                          }}
                          placeholder="Search by name, email, or User ID..."
                          className="contact-input pl-10 pr-9 text-xs font-mono"
                        />
                        {targetSearch && (
                          <button
                            type="button"
                            onClick={handleClearSelectedUser}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {showSearchDropdown && (
                        <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl divide-y divide-white/5">
                          {searchingUsers ? (
                            <div className="p-4 text-center text-xs font-mono text-white/40">
                              Searching directory...
                            </div>
                          ) : searchResults.length === 0 ? (
                            <div className="p-4 text-center text-xs font-mono text-white/40">
                              No matching users found.
                            </div>
                          ) : (
                            searchResults.map((u) => (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => handleSelectUser(u)}
                                className="w-full text-left p-3 hover:bg-white/5 flex items-center justify-between transition-all"
                              >
                                <div className="space-y-0.5">
                                  <div className="text-xs font-semibold text-white">{u.name || 'Unnamed User'}</div>
                                  <div className="text-[10px] font-mono text-white/50">{u.email}</div>
                                  <div className="text-[9px] font-mono text-[var(--gold)]/80">ID: {u.id.substring(18).toUpperCase()}</div>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono text-xs font-bold text-[var(--gold)]">{u.credits} CR</span>
                                  <span className="block text-[9px] font-mono text-white/40 uppercase">{u.role}</span>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}

                      {selectedUser && (
                        <div className="p-3 mt-2 rounded-lg bg-[rgba(212,175,55,0.06)] border border-[rgba(212,175,55,0.25)] flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono uppercase text-[#D4AF37] tracking-wider block font-bold">
                              Selected User
                            </span>
                            <div className="text-xs font-bold text-white">{selectedUser.name || 'User'}</div>
                            <div className="text-[11px] font-mono text-white/60">{selectedUser.email}</div>
                            <div className="text-[10px] font-mono text-white/40">UUID: {selectedUser.id}</div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono text-white/40 block">Current Balance</span>
                            <span className="text-lg font-mono font-bold text-[#D4AF37]">
                              {selectedUser.credits} CR
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/40">
                        Adjustment Mode
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setAdjustmentAction("upgrade")}
                          className={`py-2 px-3 rounded text-xs font-mono tracking-wider flex items-center justify-center gap-2 border transition-all ${
                            adjustmentAction === "upgrade"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.15)] font-bold"
                              : "bg-white/2 text-white/50 border-white/8 hover:text-white"
                          }`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>UPGRADE (+ ADD)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdjustmentAction("downgrade")}
                          className={`py-2 px-3 rounded text-xs font-mono tracking-wider flex items-center justify-center gap-2 border transition-all ${
                            adjustmentAction === "downgrade"
                              ? "bg-rose-500/15 text-rose-400 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.15)] font-bold"
                              : "bg-white/2 text-white/50 border-white/8 hover:text-white"
                          }`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                          <span>DOWNGRADE (- DEDUCT)</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/40">
                        Credit Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={adjustmentAmount}
                        onChange={(e) => setAdjustmentAmount(e.target.value)}
                        placeholder="e.g. 50"
                        className="contact-input text-xs font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/40">
                        Adjustment Justification Note (Required)
                      </label>
                      <textarea
                        rows={3}
                        value={adjustmentNote}
                        onChange={(e) => setAdjustmentNote(e.target.value)}
                        placeholder="Detail why credits are being upgraded or downgraded..."
                        className="contact-input text-xs font-mono py-2.5 resize-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className={`gold-button w-full justify-center py-3 flex items-center gap-2 ${
                        adjustmentAction === 'downgrade' ? 'hover:border-rose-400' : ''
                      }`}
                      disabled={rechargeLoading}
                    >
                      {rechargeLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : adjustmentAction === 'downgrade' ? (
                        <Minus className="h-4 w-4 text-rose-400" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      <span>
                        {rechargeLoading 
                          ? "Executing Update..." 
                          : `Execute Credit ${adjustmentAction === 'downgrade' ? 'Downgrade' : 'Upgrade'}`
                        }
                      </span>
                    </button>
                  </form>
                </div>
              )}

              <div className={`glow-panel ${isAdmin ? 'lg:col-span-7' : 'lg:col-span-12'} overflow-hidden`}>
                <div className="p-6 border-b border-white/6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-[var(--gold)]" />
                    <h3 className="text-lg font-mono text-white/90 uppercase tracking-wider font-bold">
                      Transaction History
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-white/40">
                    Total: {historyData.totalTransactions} transactions
                  </span>
                </div>

                <div className="min-w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/6 bg-[#0a0a0a] text-[0.68rem] font-mono uppercase tracking-[0.2em] text-white/40">
                        <th className="px-6 py-4">Action Type</th>
                        <th className="px-6 py-4">Quantity</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/4">
                      {loadingHistory ? (
                        <tr>
                          <td colSpan="4" className="text-center py-12 text-white/40 font-mono text-sm">
                            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[var(--gold)]" />
                            Loading credit logs...
                          </td>
                        </tr>
                      ) : historyData.transactions.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-12 text-white/30 text-sm italic">
                            No transactions recorded.
                          </td>
                        </tr>
                      ) : (
                        historyData.transactions.map((tx) => {
                          const isRecharge = tx.type === "recharge";
                          const isRefund = tx.type === "refund";
                          
                          return (
                            <tr key={tx._id} className="hover:bg-white/[0.01] transition text-sm">
                              {/* Action Type */}
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium ${
                                    isRecharge
                                      ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20"
                                      : isRefund
                                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                      : "bg-rose-500/10 text-rose-450 border border-rose-500/20"
                                  }`}
                                >
                                  {isRecharge ? (
                                    <ArrowUpRight className="h-3 w-3" />
                                  ) : (
                                    <ArrowDownLeft className="h-3 w-3" />
                                  )}
                                  {tx.type.toUpperCase()}
                                </span>
                              </td>

                              {/* Amount */}
                              <td
                                className={`px-6 py-4 font-mono font-bold ${
                                  isRecharge
                                    ? "text-emerald-400"
                                    : isRefund
                                    ? "text-blue-450"
                                    : "text-rose-400"
                                }`}
                              >
                                {isRecharge || isRefund ? "+" : ""}
                                {tx.amount}
                              </td>

                              {/* Description */}
                              <td className="px-6 py-4 text-white/70 text-xs">
                                {tx.description}
                              </td>

                              {/* Timestamp */}
                              <td className="px-6 py-4 text-white/50 text-xs font-mono">
                                {new Date(tx.createdAt).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Paginated Controller footer */}
                {historyData.totalPages > 1 && (
                  <div className="p-4 border-t border-white/6 flex items-center justify-between">
                    <p className="text-xs font-mono text-white/40">
                      Page {historyData.currentPage} of {historyData.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || loadingHistory}
                        className="flex h-9 w-9 items-center justify-center border border-white/10 bg-[#0d0d0d] text-white transition hover:border-[var(--gold)] hover:text-[var(--gold)] disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(historyData.totalPages, p + 1))}
                        disabled={page === historyData.totalPages || loadingHistory}
                        className="flex h-9 w-9 items-center justify-center border border-white/10 bg-[#0d0d0d] text-white transition hover:border-[var(--gold)] hover:text-[var(--gold)] disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </ProtectedWrapper>
  );
}
