"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  FileCode2,
  Globe,
  Mail,
  RefreshCw,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";

const COMMON_SECOND_LEVEL_SUFFIXES = new Set([
  "ac.in",
  "ac.uk",
  "co.in",
  "co.jp",
  "co.nz",
  "co.uk",
  "com.au",
  "com.sg",
  "gov.in",
  "gov.uk",
  "org.in",
  "org.uk",
]);

function extractHostname(input) {
  const value = String(input || "").trim();
  if (!value) return "";

  try {
    const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    return new URL(normalized).hostname.toLowerCase();
  } catch {
    return value
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "")
      .replace(/:\d+$/, "")
      .toLowerCase();
  }
}

function getRootDomain(hostname) {
  const host = extractHostname(hostname);
  const parts = host.split(".").filter(Boolean);

  if (parts.length <= 2) return host;
  const lastTwo = parts.slice(-2).join(".");
  if (COMMON_SECOND_LEVEL_SUFFIXES.has(lastTwo)) {
    return parts.slice(-3).join(".");
  }
  return lastTwo;
}

function StepBadge({ active, complete, label }) {
  const classes = complete
    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
    : active
      ? "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold)]"
      : "border-white/10 bg-white/5 text-white/55";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.7rem] uppercase tracking-[0.16em] ${classes}`}>
      {label}
    </span>
  );
}

function CopyButton({ value, label = "Copy" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:border-[var(--gold)]/35 hover:text-white"
    >
      <Copy className="h-3.5 w-3.5" />
      {copied ? "Copied" : label}
    </button>
  );
}

export default function OwnershipVerificationWizard({
  targetValue,
  targetLabel = "Website URL or Domain",
  onVerifiedChange,
  className = "",
}) {
  const protectedAction = useProtectedAction();
  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, ""),
    []
  );

  const [workEmail, setWorkEmail] = useState("");
  const [verification, setVerification] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("dns_txt");
  const [debugCode, setDebugCode] = useState("");
  const [proofDebug, setProofDebug] = useState(null);

  const rootDomain = useMemo(() => getRootDomain(targetValue), [targetValue]);
  const isVerified = verification?.status === "verified";
  const emailVerified = Boolean(verification?.emailVerifiedAt);
  const domainVerified = Boolean(verification?.domainProofVerifiedAt);

  useEffect(() => {
    onVerifiedChange?.(isVerified, verification);
  }, [isVerified, onVerifiedChange, verification]);

  useEffect(() => {
    const currentDomain = verification?.rootDomain;
    if (!rootDomain || !currentDomain) {
      if (!rootDomain && verification) {
        setVerification(null);
        setCode("");
        setDebugCode("");
        setProofDebug(null);
        setError("");
        setMessage("");
      }
      return;
    }

    if (currentDomain !== rootDomain) {
      setVerification(null);
      setCode("");
      setDebugCode("");
      setProofDebug(null);
      setError("");
      setMessage("");
    }
  }, [rootDomain, verification]);

  async function runProtectedRequest(callback) {
    setSending(true);
    setError("");
    setMessage("");
    try {
      await protectedAction(async (token) => {
        await callback(token);
      });
    } finally {
      setSending(false);
    }
  }

  const startVerification = async () => {
    if (!targetValue?.trim()) {
      setError(`Enter ${targetLabel.toLowerCase()} before starting verification.`);
      return;
    }
    if (!workEmail.trim()) {
      setError("Enter your work email to start ownership verification.");
      return;
    }

    await runProtectedRequest(async (token) => {
      setProofDebug(null);
      const response = await fetch(`${apiBase}/ownership/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          websiteUrl: targetValue.trim(),
          claimedEmail: workEmail.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setVerification(data.verification || null);
        setProofDebug({ reasonCodes: data.verification?.reasonCodes || [] });
        setError(data.message || "Failed to start ownership verification.");
        return;
      }

      setVerification(data.verification || null);
      setProofDebug(null);
      setMessage(data.message || "Verification started.");
    });
  };

  const sendEmailCode = async () => {
    if (!verification?.id) return;

    await runProtectedRequest(async (token) => {
      const response = await fetch(`${apiBase}/ownership/send-email-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ verificationId: verification.id }),
      });

      const data = await response.json();
      if (!response.ok) {
        setVerification(data.verification || verification);
        setProofDebug({ reasonCodes: data.verification?.reasonCodes || [] });
        setError(data.message || "Failed to send the email verification code.");
        return;
      }

      setVerification(data.verification || verification);
      setProofDebug(null);
      setDebugCode(data.debugCode || "");
      setMessage(data.message || "Verification code sent.");
    });
  };

  const confirmEmailCode = async () => {
    if (!verification?.id) return;
    if (!code.trim()) {
      setError("Enter the verification code from your work email.");
      return;
    }

    await runProtectedRequest(async (token) => {
      const response = await fetch(`${apiBase}/ownership/confirm-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          verificationId: verification.id,
          code: code.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setVerification(data.verification || verification);
        setProofDebug({ reasonCodes: data.verification?.reasonCodes || [] });
        setError(data.message || "Failed to verify the email code.");
        return;
      }

      setVerification(data.verification || verification);
      setProofDebug(null);
      setMessage(data.message || "Email verified.");
    });
  };

  const checkDomainProof = async (method) => {
    if (!verification?.id) return;
    setSelectedMethod(method);

    await runProtectedRequest(async (token) => {
      const response = await fetch(`${apiBase}/ownership/check-domain-proof`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          verificationId: verification.id,
          method,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setVerification(data.verification || verification);
        setProofDebug({
          method,
          proofResult: data.proofResult,
          reasonCodes: data.verification?.reasonCodes || [],
        });
        setError(data.message || "Domain proof could not be confirmed yet.");
        return;
      }

      setVerification(data.verification || verification);
      setProofDebug(null);
      setMessage(data.message || "Domain control verified.");
    });
  };

  return (
    <section className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left ${className}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="eyebrow mb-3">Ownership Verification</p>
          <h3 className="font-mono text-xl font-semibold text-white">
            Verify asset ownership before scanning
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
            We require a same-organization work email plus a DNS TXT or HTTP file proof on{" "}
            <span className="text-white">{rootDomain || "your target domain"}</span>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StepBadge active={!verification} complete={Boolean(verification)} label="1. Start" />
          <StepBadge active={Boolean(verification) && !emailVerified} complete={emailVerified} label="2. Email" />
          <StepBadge active={emailVerified && !domainVerified} complete={domainVerified} label="3. Proof" />
          <StepBadge active={isVerified} complete={isVerified} label="4. Scan" />
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
          {proofDebug ? (
            <div className="mt-3 space-y-2 rounded-lg border border-rose-300/15 bg-black/20 p-3 text-xs text-rose-100/85">
              {proofDebug.method ? (
                <p className="font-mono uppercase tracking-[0.14em]">
                  Method: {proofDebug.method === "http_file" ? "HTTP file" : "DNS TXT"}
                </p>
              ) : null}
              {proofDebug.reasonCodes?.length ? (
                <p>Reason codes: {proofDebug.reasonCodes.join(", ")}</p>
              ) : null}
              {proofDebug.proofResult?.checkedUrls?.length ? (
                <div>
                  <p className="mb-1 font-medium">Checked URLs</p>
                  <ul className="space-y-1 font-mono break-all">
                    {proofDebug.proofResult.checkedUrls.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {proofDebug.proofResult?.details?.length ? (
                <div>
                  <p className="mb-1 font-medium">TXT values found</p>
                  <ul className="space-y-1 font-mono break-all">
                    {proofDebug.proofResult.details.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {message ? (
        <div className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      ) : null}

      {isVerified ? (
        <div className="mt-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
            <div>
              <p className="font-medium text-emerald-100">
                Ownership verified for {verification?.rootDomain}
              </p>
              <p className="mt-1 text-sm text-emerald-200/85">
                This verification stays valid until{" "}
                {verification?.verificationValidUntil
                  ? new Date(verification.verificationValidUntil).toLocaleString()
                  : "the configured expiry window ends"}
                .
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {!verification ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <label htmlFor="ownership-work-email" className="block text-sm font-medium text-[var(--text-body)]">
              Work email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                id="ownership-work-email"
                type="email"
                value={workEmail}
                onChange={(event) => setWorkEmail(event.target.value)}
                placeholder="security@company.com"
                className="tool-scan-input"
                style={{ paddingLeft: "2.75rem" }}
              />
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Use a company-managed email that matches {rootDomain || "the target domain"} or one of its approved subdomains.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-medium text-white">What this checks</p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
              <li className="flex gap-2"><Globe className="mt-0.5 h-4 w-4 text-[var(--gold)]" /> Email-domain match</li>
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-[var(--gold)]" /> Domain control proof</li>
              <li className="flex gap-2"><FileCode2 className="mt-0.5 h-4 w-4 text-[var(--gold)]" /> WHOIS / RDAP / DNS context</li>
            </ul>
          </div>
          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={startVerification}
              disabled={sending}
              className="gold-button w-full justify-center"
            >
              {sending ? "Starting verification..." : "Start Verification"}
            </button>
          </div>
        </div>
      ) : null}

      {verification && !emailVerified ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-medium text-white">Email verification</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              We send a one-time code to <span className="text-white">{verification.claimedEmail}</span>. The code expires after a short time for safety.
            </p>
            <button
              type="button"
              onClick={sendEmailCode}
              disabled={sending}
              className="ghost-button mt-4 w-full justify-center"
            >
              {sending ? "Sending..." : verification?.emailCodeSentAt ? "Resend Code" : "Send Code"}
            </button>
            {debugCode ? (
              <p className="mt-3 text-xs text-amber-200">
                Dev-only debug code: <span className="font-mono text-white">{debugCode}</span>
              </p>
            ) : null}
          </div>
          <div className="space-y-3">
            <label htmlFor="ownership-verification-code" className="block text-sm font-medium text-[var(--text-body)]">
              Verification code
            </label>
            <input
              id="ownership-verification-code"
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Enter the 6-digit code"
              className="tool-scan-input"
            />
            <button
              type="button"
              onClick={confirmEmailCode}
              disabled={sending}
              className="gold-button w-full justify-center"
            >
              {sending ? "Verifying..." : "Verify Email Code"}
            </button>
          </div>
        </div>
      ) : null}

      {verification && emailVerified && !domainVerified ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            Email ownership is verified. Choose one domain proof method below, publish the token, then check it.
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className={`rounded-xl border p-4 ${selectedMethod === "dns_txt" ? "border-[var(--gold)]/35 bg-[var(--gold)]/8" : "border-white/10 bg-black/20"}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">DNS TXT proof</p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Create a TXT record on the target root domain and paste the signed token below as the value.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMethod("dns_txt")}
                  className="ghost-button px-4 py-2"
                >
                  Use DNS
                </button>
              </div>

              <div className="mt-4 space-y-3 rounded-lg border border-white/10 bg-black/25 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Record Name</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <code className="type-code text-sm text-white">{verification.dnsTxtRecordName}</code>
                    <CopyButton value={verification.dnsTxtRecordName} />
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">TXT Value</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <code className="type-code max-w-[75%] break-all text-sm text-white">{verification.dnsTxtToken}</code>
                    <CopyButton value={verification.dnsTxtToken} />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => checkDomainProof("dns_txt")}
                disabled={sending}
                className="gold-button mt-4 w-full justify-center"
              >
                {sending && selectedMethod === "dns_txt" ? "Checking DNS proof..." : "Check DNS TXT Proof"}
              </button>
            </article>

            <article className={`rounded-xl border p-4 ${selectedMethod === "http_file" ? "border-[var(--gold)]/35 bg-[var(--gold)]/8" : "border-white/10 bg-black/20"}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">HTTP file proof</p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Host a plain-text file at the exact path below and include only the signed token content.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMethod("http_file")}
                  className="ghost-button px-4 py-2"
                >
                  Use File
                </button>
              </div>

              <div className="mt-4 space-y-3 rounded-lg border border-white/10 bg-black/25 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">File URL</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <code className="type-code max-w-[75%] break-all text-sm text-white">
                      https://{verification.rootDomain}
                      {verification.httpFilePath}
                    </code>
                    <CopyButton
                      value={`https://${verification.rootDomain}${verification.httpFilePath}`}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">File Content</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <code className="type-code max-w-[75%] break-all text-sm text-white">{verification.httpFileToken}</code>
                    <CopyButton value={verification.httpFileToken} />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => checkDomainProof("http_file")}
                disabled={sending}
                className="gold-button mt-4 w-full justify-center"
              >
                {sending && selectedMethod === "http_file" ? "Checking file proof..." : "Check HTTP File Proof"}
              </button>
            </article>
          </div>
        </div>
      ) : null}

      {verification?.status === "failed" ? (
        <div className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
          <div className="flex items-start gap-3">
            <ShieldX className="mt-0.5 h-5 w-5 text-rose-300" />
            <div>
              <p className="font-medium">Ownership verification failed</p>
              <p className="mt-1 text-rose-100/85">
                Review the target, work email, and proof method, then start a fresh verification session.
              </p>
              {verification.reasonCodes?.length ? (
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-rose-200/80">
                  Reason codes: {verification.reasonCodes.join(", ")}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-[var(--text-muted)]">
        <div className="flex items-start gap-3">
          <RefreshCw className="mt-0.5 h-4 w-4 text-[var(--gold)]" />
          <p>
            DNS and CDN changes can take time to propagate. If your proof is newly published, wait a few minutes and run the proof check again instead of starting a brand-new scan.
          </p>
        </div>
      </div>
    </section>
  );
}
