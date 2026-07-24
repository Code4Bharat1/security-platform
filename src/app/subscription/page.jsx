"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Shield,
  Zap,
  Award,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Calendar,
  CreditCard,
  History,
  ArrowRight
} from "lucide-react";
import { toast } from "react-hot-toast";
import ProtectedWrapper from "@/components/ProtectedWrapper";
import SectionIntro from "@/components/marketing/SectionIntro";
import RazorpayCheckoutButton from "@/components/payment/RazorpayCheckoutButton";

const PLAN_CARDS = [
  {
    name: "Free",
    price: 0,
    credits: 10,
    icon: Shield,
    iconColor: "text-white/40",
    borderColor: "border-white/5",
    features: [
      "Core vulnerability assessments",
      "10 baseline scanning credits",
      "Standard community documentation",
      "Single-domain testing limit"
    ]
  },
  {
    name: "Basic",
    price: 799,
    credits: 100,
    icon: Zap,
    iconColor: "text-blue-400",
    borderColor: "border-blue-500/20",
    features: [
      "All Free features included",
      "100 testing credits allocated",
      "WAF and TLS configuration scans",
      "Email support service level",
      "Up to 3 verified domains"
    ]
  },
  {
    name: "Pro",
    price: 2499,
    credits: 500,
    icon: Award,
    iconColor: "text-[var(--gold)]",
    borderColor: "border-[var(--gold)]/30",
    features: [
      "All Basic features included",
      "500 testing credits allocated",
      "Advanced XSS & CSRF audit testing",
      "Brute force and session verification",
      "Prioritized engineering support"
    ]
  },
  {
    name: "Enterprise",
    price: 7999,
    credits: 2000,
    icon: Sparkles,
    iconColor: "text-purple-400",
    borderColor: "border-purple-500/20",
    features: [
      "All Pro features included",
      "2,000 testing credits allocated",
      "Full API scan compliance suite",
      "Dedicated account security adviser",
      "Unlimited domain verification"
    ]
  }
];

export default function SubscriptionPage() {
  const [currentSub, setCurrentSub] = useState({
    plan: "Free",
    amount: 0,
    status: "active",
    startDate: new Date(),
    endDate: new Date(),
    paymentStatus: "paid"
  });
  const [invoices, setInvoices] = useState([]);
  const [userCredits, setUserCredits] = useState(null);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchCredits = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/credits/balance`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const data = await res.json();
      if (res.ok) {
        setUserCredits(data.available);
      }
    } catch (err) {
      console.error("Error fetching credits:", err);
    }
  };

  const fetchCurrentSub = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingCurrent(false);
      return;
    }

    setLoadingCurrent(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/subscription/current`,
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
      if (!res.ok) throw new Error(data.message || "Failed to load current plan.");
      setCurrentSub(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Error fetching subscription profile.");
    } finally {
      setLoadingCurrent(false);
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
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/subscription/history`,
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
      if (!res.ok) throw new Error(data.message || "Failed to load purchase history.");
      setInvoices(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Could not retrieve invoice lists.");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchCurrentSub();
    fetchHistory();
    fetchCredits();
  }, []);

  // Called by RazorpayCheckoutButton after a successful payment verification
  const refreshSubscriptionState = async (verifyData) => {
    // Update local storage user credits if available
    const storedUser = localStorage.getItem("user");
    if (storedUser && verifyData?.credits) {
      const parsed = JSON.parse(storedUser);
      parsed.credits = verifyData.credits;
      localStorage.setItem("user", JSON.stringify(parsed));
    }

    setSuccessMsg(`Successfully upgraded to the ${verifyData?.plan || "new"} Plan!`);
    setErrorMsg("");

    // Refresh all subscription data from the backend
    await Promise.all([fetchCurrentSub(), fetchHistory(), fetchCredits()]);
  };

  const handleUpgrade = async (planName) => {
    setErrorMsg("");
    setSuccessMsg("");
    setActionLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/subscription/upgrade`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ plan: planName })
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upgrade failed.");

      setSuccessMsg(`Successfully upgraded to the ${planName} Plan!`);
      
      // Update local storage user credits if it exists
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.credits = data.credits;
        localStorage.setItem("user", JSON.stringify(parsed));
      }

      await Promise.all([fetchCurrentSub(), fetchHistory(), fetchCredits()]);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Plan upgrade request failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenew = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setActionLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/subscription/renew`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Renewal failed.");

      setSuccessMsg(`Successfully renewed your ${currentSub.plan} plan!`);

      // Update local storage user credits if it exists
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.credits = data.credits;
        localStorage.setItem("user", JSON.stringify(parsed));
      }

      await Promise.all([fetchCurrentSub(), fetchHistory(), fetchCredits()]);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Plan renewal request failed.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <ProtectedWrapper>
      <main className="site-page-shell bg-[#050505] text-white min-h-screen">
        <section className="border-b border-white/6 pb-20">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <SectionIntro
              eyebrow="Pricing & Tiers"
              title="Billing & Subscription"
              description="Review subscription features, purchase plan upgrades, renew billing periods, and check payment logs."
              className="mb-12"
            />

            {/* Notification Messages */}
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

            {/* Active Subscription Block */}
            <div className="glow-panel p-6 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="h-5 w-5 text-[var(--gold)]" />
                  <span className="font-mono text-xs uppercase tracking-wider text-white/40">Active Subscription</span>
                </div>
                {loadingCurrent ? (
                  <div className="h-7 w-48 bg-white/5 animate-pulse rounded mt-2" />
                ) : (
                  <h3 className="text-2xl font-mono font-bold text-white/90">
                    {currentSub.plan} Plan
                    <span className="ml-3 text-xs inline-flex items-center rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 font-mono font-semibold text-emerald-450 uppercase">
                      {currentSub.status}
                    </span>
                  </h3>
                )}
                <div className="flex items-center gap-4 text-xs text-white/50">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Renewal Date: {loadingCurrent ? "..." : new Date(currentSub.endDate).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>Price: {loadingCurrent ? "..." : `₹${currentSub.amount} / month`}</span>
                </div>
              </div>

              {!loadingCurrent && currentSub.plan !== "Free" && userCredits === 0 && (
                <button
                  type="button"
                  onClick={handleRenew}
                  disabled={actionLoading}
                  className="gold-button flex items-center gap-2 px-6 py-3 cursor-pointer"
                >
                  {actionLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span>Renew Active Plan</span>
                </button>
              )}
            </div>

            {/* Pricing Grid */}
            <div className="mb-16">
              <div className="text-center mb-8">
                <h4 className="font-mono text-sm uppercase tracking-[0.2em] text-[var(--gold)]">Standard Pricing Tiers</h4>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {PLAN_CARDS.map((card) => {
                  const Icon = card.icon;
                  const isCurrent = !loadingCurrent && currentSub.plan === card.name;
                  const isFree = card.name === "Free";
                  
                  return (
                    <div
                      key={card.name}
                      className={`glow-panel p-6 flex flex-col justify-between border ${card.borderColor} transition hover:border-[var(--gold)]/40 relative overflow-hidden`}
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div>
                            <h4 className="font-mono font-bold text-lg text-white/95">{card.name}</h4>
                            <span className="text-xs font-mono text-white/40">{card.credits} scan credits</span>
                          </div>
                          <Icon className={`h-6 w-6 ${card.iconColor}`} />
                        </div>

                        {/* Price */}
                        <div className="py-2">
                          <span className="text-3xl font-mono font-bold text-white/90">₹{card.price}</span>
                          <span className="text-xs text-white/40 ml-1">/ month</span>
                        </div>

                        {/* Feature checklist */}
                        <ul className="space-y-2.5 text-xs text-white/60">
                          {card.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="h-3.5 w-3.5 text-[var(--gold)] flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Upgrade CTA */}
                      <div className="pt-6 mt-6 border-t border-white/5">
                        {isCurrent ? (
                          <button
                            type="button"
                            className="w-full justify-center py-2.5 text-xs uppercase tracking-[0.15em] border border-white/10 bg-[#0d0d0d] text-[var(--gold)] cursor-not-allowed font-semibold"
                            disabled
                          >
                            Current Plan
                          </button>
                        ) : isFree ? (
                          <button
                            type="button"
                            className="w-full justify-center py-2.5 text-xs uppercase tracking-[0.15em] border border-white/10 bg-[#0c0c0c] text-white/30 cursor-not-allowed"
                            disabled
                          >
                            Default Tier
                          </button>
                        ) : (
                          <RazorpayCheckoutButton
                            plan={card}
                            onPaymentSuccess={refreshSubscriptionState}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Invoicing Purchase History */}
            <div className="glow-panel overflow-hidden">
              <div className="p-6 border-b border-white/6 flex items-center gap-2">
                <History className="h-4 w-4 text-[var(--gold)]" />
                <h3 className="text-lg font-mono text-white/90 uppercase tracking-wider font-bold">
                  Subscription Invoices
                </h3>
              </div>

              <div className="min-w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/6 bg-[#0a0a0a] text-[0.68rem] font-mono uppercase tracking-[0.2em] text-white/40">
                      <th className="px-6 py-4">Invoice Plan</th>
                      <th className="px-6 py-4">Billing Date</th>
                      <th className="px-6 py-4">Amount Paid</th>
                      <th className="px-6 py-4">Payment Status</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/4">
                    {loadingHistory ? (
                      <tr>
                        <td colSpan="5" className="text-center py-12 text-white/40 font-mono text-sm">
                          <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[var(--gold)]" />
                          Loading invoice history...
                        </td>
                      </tr>
                    ) : invoices.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-12 text-white/30 text-sm italic">
                          No past invoices recorded. Upgrades and renewals will be logged here.
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv) => (
                        <tr key={inv._id} className="hover:bg-white/[0.01] transition text-sm">
                          {/* Plan */}
                          <td className="px-6 py-4 font-mono font-bold text-[var(--gold)]">
                            {inv.plan} Plan
                          </td>

                          {/* Billing Date */}
                          <td className="px-6 py-4 text-white/60 font-mono text-xs">
                            {new Date(inv.startDate).toLocaleDateString()} to {new Date(inv.endDate).toLocaleDateString()}
                          </td>

                          {/* Price */}
                          <td className="px-6 py-4 font-mono text-white/80">
                            ₹{inv.amount}.00
                          </td>

                          {/* Payment status */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold uppercase">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              {inv.paymentStatus}
                            </span>
                          </td>

                          {/* Active / Expired / Upgraded Status */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium ${
                                inv.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20"
                                  : inv.status === "upgraded"
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                  : "bg-white/5 text-white/40 border border-white/10"
                              }`}
                            >
                              {inv.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
    </ProtectedWrapper>
  );
}
