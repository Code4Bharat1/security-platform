"use client";

import { useState } from "react";
import { ShieldAlert, ExternalLink, HelpCircle, Info } from "lucide-react";

export default function CyberFraudIdentifier() {
  const [selectedOption, setSelectedOption] = useState("upi-id");
  const radioOptions = [
    { value: "upi-id", label: "UPI ID" },
    { value: "mobile", label: "Mobile Number" },
    { value: "email", label: "Email ID" },
    { value: "bank-acc", label: "Bank Account Number" },
    { value: "social-media", label: "Social Media Profile" },
    { value: "website", label: "Website Address" },
    { value: "app", label: "App Name" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Selected verification target:", selectedOption);
    let link = "";
    if (["upi-id", "mobile", "email", "bank-acc", "social-media"].includes(selectedOption)) {
      link = "https://cybercrime.gov.in/";
    } else {
      link = "https://cybercrime.gov.in/Webform/suspect_search_websites.aspx";
    }
    window.open(link, "_blank");
  };

  return (
    <div className="tool-detail-page min-h-screen">
      <div className="tool-detail-shell">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 mb-8">
          <span className="rounded-full border border-purple-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-purple-400 bg-purple-500/10">
            Purple Team
          </span>
        </div>

        {/* Title Section */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-purple-500/30 bg-purple-500/10 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-[color:var(--text-heading)]">
              CYBER FRAUD <span className="text-purple-500">IDENTIFIER</span>
            </h1>
            <p className="mt-2 text-[color:var(--text-muted)] max-w-2xl text-base">
              Identify and validate potential online fraud resources against official national repositories and blacklists.
            </p>
          </div>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column: Form Controls */}
          <div className="space-y-6">
            <div className="bg-[color:var(--surface-card)] border border-[color:var(--border)] rounded-2xl p-6 shadow-[var(--shadow-soft)]">
              <h2 className="text-lg font-mono font-semibold text-[color:var(--text-heading)] mb-6 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-purple-400" />
                Select Identifier Type
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  {radioOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 text-sm cursor-pointer group p-3.5 rounded-xl border transition-all ${
                        selectedOption === option.value
                          ? "border-purple-500/50 bg-purple-500/5 text-white"
                          : "border-[color:var(--border)]/40 bg-white/[0.01] text-[color:var(--text-heading)] hover:bg-white/[0.03] hover:border-[color:var(--border)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="identifier"
                        value={option.value}
                        className="w-4 h-4 text-purple-500 focus:ring-purple-500 bg-transparent border-[color:var(--border)]"
                        checked={selectedOption === option.value}
                        onChange={(e) => setSelectedOption(e.target.value)}
                      />
                      <span className="transition font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Query Suspect Database
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Sidebar Specs / Guidance */}
          <div className="space-y-6">
            <div className="border border-[color:var(--border)] bg-black/20 rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[color:var(--text-heading)] flex items-center gap-2">
                <Info className="h-4 w-4 text-purple-400" />
                Audit Scope & Specs
              </h4>
              <ul className="space-y-3 text-xs text-[color:var(--text-muted)] list-disc pl-4 leading-relaxed">
                <li>Directly integrates search redirects to the National Cyber Crime portal repositories.</li>
                <li>UPI IDs and Bank Accounts query blacklisted financial transaction handles.</li>
                <li>Websites and Apps options route suspect queries to domain-level verification tools.</li>
                <li>Used to audit prospective client or vendor data objects prior to transactions.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}