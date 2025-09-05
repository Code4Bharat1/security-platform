"use client";
import { useState } from "react";

export default function DbSecurityChecker() {
  const [form, setForm] = useState({
    dbType: 'MongoDB',
    host: '127.0.0.1',
    port: '27017',
    username: '',
    password: '',
    checks: []
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const toggleCheck = (check) => {
    setForm(prev => ({
      ...prev,
      checks: prev.checks.includes(check)
        ? prev.checks.filter(c => c !== check)
        : [...prev.checks, check]
    }));
  };

  const runScan = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/dbscan/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Scan error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4">
     <img src="/tools/card-images/DB-Security.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />

      <h1 className="text-2xl font-bold text-green-800 mb-4">🛡️ Database Security Score Checker</h1>
      <div className="bg-white p-4 rounded shadow max-w-md w-full">
        <div className="mb-2">DB Type:
          <select value={form.dbType} onChange={e => setForm({ ...form, dbType: e.target.value })}
            className="ml-2 border px-2">
            <option>MongoDB</option>
            {/* future: MySQL, PostgreSQL */}
          </select>
        </div>
        <div className="mb-2">Host/IP:
          <input value={form.host} onChange={e => setForm({ ...form, host: e.target.value })}
            className="ml-2 border px-2" />
        </div>
        <div className="mb-2">Port:
          <input value={form.port} onChange={e => setForm({ ...form, port: e.target.value })}
            className="ml-2 border px-2" />
        </div>
        <div className="mb-2">Username:
          <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
            className="ml-2 border px-2" />
        </div>
        <div className="mb-2">Password:
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            className="ml-2 border px-2" />
        </div>

        <div className="mb-2">
          <label><input type="checkbox" checked={form.checks.includes('ssl')} onChange={() => toggleCheck('ssl')} /> SSL/TLS</label>
          <label className="ml-2"><input type="checkbox" checked={form.checks.includes('auth')} onChange={() => toggleCheck('auth')} /> Auth</label>
          <label className="ml-2"><input type="checkbox" checked={form.checks.includes('encryption')} onChange={() => toggleCheck('encryption')} /> Encryption</label>
        </div>

        <button onClick={runScan} disabled={loading}
          className={`w-full py-2 mt-2 rounded text-white ${loading ? "bg-green-400" : "bg-green-700 hover:bg-green-800"}`}>
          {loading ? "Scanning..." : "🚀 Run Security Scan"}
        </button>
      </div>

      {result && (
        <div className="bg-black text-green-400 mt-4 p-4 w-full max-w-md rounded font-mono text-sm">
          <p>📊 Security Score: {result.securityScore}/100</p>
          <p>❗ Issues Found: {result.issues}</p>
          {result.findings.map((f, i) => (
            <p key={i}>{f.type === 'warning' ? '⚠️' : '✅'} {f.message}</p>
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
