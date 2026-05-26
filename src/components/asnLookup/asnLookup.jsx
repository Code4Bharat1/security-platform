"use client"
import { useState } from "react";
import {
  Search,
  CheckCircle,
  AlertCircle,
  Globe,
  Building,
  MapPin,
  FileText,
  Database,
} from "lucide-react";

// Toast Component
function Toast({ message, type, onClose }) {
  const bgColor =
    type === "success"
      ? "bg-[color:var(--success)]"
      : "bg-[color:var(--danger)]";
  const icon =
    type === "success" ? (
      <CheckCircle className="w-5 h-5" />
    ) : (
      <AlertCircle className="w-5 h-5" />
    );

  return (
    <div
      className={`fixed right-4 top-4 z-50 flex items-center gap-2 rounded-lg border border-[color:var(--border)] ${bgColor} px-6 py-3 text-[color:var(--text-inverse)] shadow-[var(--shadow-soft)] animate-in slide-in-from-top-2`}
    >
      {icon}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        ×
      </button>
    </div>
  );
}

// ASN Lookup Component
export default function ASNLookupFullPage() {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!ip.trim()) {
      setError("Please enter an IP address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/asnLookup/lookupasn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unknown error");
        showToast("Failed to lookup ASN information", "error");
      } else {
        setResult(data.asnInfo);
        showToast("ASN information retrieved successfully!", "success");
      }
    } catch (err) {
      setError("Failed to fetch ASN data.");
      showToast("Network error occurred", "error");
    }

    setLoading(false);
  }

  const clearForm = () => {
    setIp("");
    setResult(null);
    setError("");
  };

  return (
    <div className="tool-detail-page min-h-screen">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="tool-detail-shell">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--gold)] bg-[color:var(--surface-subtle)]">
              <Globe className="h-8 w-8 text-[color:var(--gold)]" />
            </div>
            <h1 className="mb-2 text-4xl font-bold text-[color:var(--text-heading)]">
              ASN Lookup
            </h1>
            <p className="text-[color:var(--text-muted)]">
              Discover network information for any IP address
            </p>
          </div>

          {/* Main Card */}
          <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-card)] shadow-[var(--shadow-elevated)]">
            {/* Form Section */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <label
                    htmlFor="ip-input"
                    className="mb-2 block text-sm font-medium text-[color:var(--text-body)]"
                  >
                    IP Address
                  </label>
                  <div className="relative">
                    <input
                      id="ip-input"
                      type="text"
                      value={ip}
                      onChange={(e) => setIp(e.target.value.trim())}                     placeholder="Enter IPv4 or IPv6 address (e.g., 8.8.8.8)"
                      className="w-full rounded-xl border pl-12 pr-4 py-3 text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)] focus:outline-none"
                    />
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--gold)]" />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500 bg-red-900/20 p-4 text-[color:var(--danger)]">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-xl border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 font-medium text-[color:var(--text-inverse)] shadow-[var(--shadow-soft)] transition-all duration-200 hover:bg-[color:var(--gold-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Looking up...
                      </div>
                    ) : (
                      "Lookup ASN"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={clearForm}
                    className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-subtle)] px-6 py-3 font-medium text-[color:var(--text-body)] transition-all duration-200 hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>

            {/* Results Section */}
            {result && (
              <div className="border-t border-[color:var(--border)] bg-[color:var(--surface-subtle)] p-8">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle className="h-6 w-6 text-[color:var(--success)]" />
                  <h3 className="text-xl font-semibold text-[color:var(--text-heading)]">
                    ASN Information
                  </h3>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-card)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--surface-subtle)]">
                        <Database className="h-5 w-5 text-[color:var(--gold)]" />
                      </div>
                      <div>
                        <p className="text-sm text-[color:var(--text-muted)]">ASN Number</p>
                        <p className="font-mono text-lg font-semibold text-[color:var(--text-heading)]">
                          {result.asn}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-card)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--surface-subtle)]">
                        <Building className="h-5 w-5 text-[color:var(--gold)]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[color:var(--text-muted)]">Organization</p>
                        <p className="text-lg font-semibold text-[color:var(--text-heading)]">
                          {result.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-card)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--surface-subtle)]">
                        <MapPin className="h-5 w-5 text-[color:var(--gold)]" />
                      </div>
                      <div>
                        <p className="text-sm text-[color:var(--text-muted)]">Country</p>
                        <p className="font-mono text-lg font-semibold text-[color:var(--text-heading)]">
                          {result.country_code}
                        </p>
                      </div>
                    </div>
                  </div>

                  {result.description && (
                    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-card)] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--surface-subtle)]">
                          <FileText className="h-5 w-5 text-[color:var(--gold)]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-[color:var(--text-muted)]">Description</p>
                          <p className="text-lg font-semibold text-[color:var(--text-heading)]">
                            {result.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-card)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--surface-subtle)]">
                        <Globe className="h-5 w-5 text-[color:var(--gold)]" />
                      </div>
                      <div>
                        <p className="text-sm text-[color:var(--text-muted)]">Registry</p>
                        <p className="font-mono text-lg font-semibold text-[color:var(--text-heading)]">
                          {result.registry}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-[color:var(--text-muted)]">
            <p>Enter any IPv4 or IPv6 address to retrieve ASN information</p>
          </div>
        </div>
      </div>
    </div>
  );
}
