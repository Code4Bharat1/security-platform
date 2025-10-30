"use client";
import { useState } from "react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

export default function DbSecurityChecker() {
  const [form, setForm] = useState({
    dbType: "MongoDB",
    host: "127.0.0.1",
    port: "27017",
    username: "",
    password: "",
    checks: [],
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const protectedAction = useProtectedAction();

  const toggleCheck = (check) => {
    setForm((prev) => ({
      ...prev,
      checks: prev.checks.includes(check)
        ? prev.checks.filter((c) => c !== check)
        : [...prev.checks, check],
    }));
  };

  const runScan = async () => {
    if (!protectedAction) return; // ensure hook is available

    await protectedAction(async (token) => {
      setLoading(true);
      setResult(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/dbscan/scan`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(form),
          }
        );

        const data = await res.json();
        setResult(data);
      } catch (err) {
        console.error("Scan error:", err);
        setResult({ error: err?.message || "Unexpected error" });
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-900 p-6">
      {/* Header */}
      <div className="flex items-center mb-6 gap-4  mt-15">
        <div className="w-30 h-30 sm:w-24 sm:h-24 md:w-30 md:h-30 rounded-full border-4 border-red-600 overflow-hidden flex items-center justify-center bg-black flex-shrink-0">
          <img
            src="/RedTeam/DB-Security.png"
            alt="DB Logo"
            className="w-30 h-30 sm:w-16 sm:h-16 md:w-16 md:h-16 object-cover"
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-white">
            Database Security Checker
          </h1>
          <p className="text-gray-300 text-sm">
            Database Safety Checker With Score
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-black text-white p-6 rounded-2xl shadow-lg w-full max-w-4xl border-2 border-white-600">
        <div className="mb-4">
          <label className="block mb-1">DB Type:</label>
          <select
            value={form.dbType}
            onChange={(e) => setForm({ ...form, dbType: e.target.value })}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-white-700 focus:outline-none"
          >
            <option>MongoDB</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1">Host / IP:</label>
          <input
            value={form.host}
            onChange={(e) => setForm({ ...form, host: e.target.value })}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-white-700 focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Port:</label>
          <input
            value={form.port}
            onChange={(e) => setForm({ ...form, port: e.target.value })}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-white-700 focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Username:</label>
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-white-700 focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Password:</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-white-700 focus:outline-none"
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.checks.includes("ssl")}
              onChange={() => toggleCheck("ssl")}
            />
            SSL/TLS
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.checks.includes("auth")}
              onChange={() => toggleCheck("auth")}
            />
            Auth
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.checks.includes("encryption")}
              onChange={() => toggleCheck("encryption")}
            />
            Encryption
          </label>
        </div>

        <button
          onClick={runScan}
          disabled={loading}
          className={`w-full py-2 mt-2 rounded text-white ${
            loading ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading ? "Scanning..." : "Run Security Scan"}
        </button>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-gray-800 text-green-400 mt-6 p-4 w-full max-w-md rounded-lg font-mono text-sm border border-white-600">
          <p>📊 Security Score: {result.securityScore}/100</p>
          <p>❗ Issues Found: {result.issues}</p>
          {result.findings.map((f, i) => (
            <p key={i}>
              {f.type === "warning" ? "⚠️" : "✅"} {f.message}
            </p>
          ))}
          {result.suggestions.length > 0 && (
            <>
              <p className="mt-2">💡 Suggestions:</p>
              {result.suggestions.map((s, i) => (
                <p key={i}>- {s}</p>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
