"use client";

import { useEffect, useState } from "react";
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  History,
  TrendingUp,
  Cpu
} from "lucide-react";
import ProtectedWrapper from "@/components/ProtectedWrapper";
import SectionIntro from "@/components/marketing/SectionIntro";

export default function CreditsPage() {
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
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [rechargeLoading, setRechargeLoading] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

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

  const handleRecharge = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    const amountNum = parseInt(rechargeAmount);
    if (!amountNum || amountNum < 1) {
      setErrorMsg("Please enter a valid credit amount to recharge (min 1).");
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
          body: JSON.stringify({ amount: amountNum })
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Recharge failed.");
      
      setSuccessMsg(`Successfully recharged ${amountNum} credits!`);
      setRechargeAmount("");
      
      // Update local storage user credits if it exists
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.credits = data.user.credits;
        localStorage.setItem("user", JSON.stringify(parsed));
      }

      // Refresh data
      await Promise.all([fetchBalance(), fetchHistory()]);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to process recharge request.");
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
              description="Monitor available credits, view transaction history, and purchase additional testing units for security scans."
              className="mb-12"
            />

            {/* Success and Error Alerts */}
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

            {/* Metrics Dashboard Row */}
            <div className="grid gap-6 sm:grid-cols-3 mb-10">
              {/* Card 1: Available */}
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

              {/* Card 2: Used */}
              <div className="glow-panel p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs uppercase tracking-wider text-white/40">Total Consumed</span>
                  <Cpu className="h-5 w-5 text-rose-450" />
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

              {/* Card 3: Recharged */}
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

            {/* Main Content Split Grid */}
            <div className="grid gap-8 lg:grid-cols-12 items-start">
              {/* Left Side: Recharge Credits Form */}
              <div className="glow-panel p-6 lg:col-span-4 space-y-6">
                <div>
                  <h3 className="text-lg font-mono text-[var(--gold)] uppercase tracking-wider font-bold">
                    Recharge Balance
                  </h3>
                  <p className="text-xs text-white/50 mt-1">
                    Instantly load testing units onto your account to authorize scanner requests.
                  </p>
                </div>

                <form onSubmit={handleRecharge} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/40">
                      Credit Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      placeholder="e.g. 50"
                      className="contact-input"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="gold-button w-full justify-center py-3 flex items-center gap-2"
                    disabled={rechargeLoading}
                  >
                    {rechargeLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    <span>Recharge Account</span>
                  </button>
                </form>
              </div>

              {/* Right Side: Credit Transaction History */}
              <div className="glow-panel lg:col-span-8 overflow-hidden">
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
