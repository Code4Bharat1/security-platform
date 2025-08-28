"use client";
import { useEffect, useMemo, useRef, useState } from "react";

/** ===== API base from env (with fallbacks) ===== */
const API_BASE = (
  process.env.NEXT_PUBLIC_PROD_API_ ||
  (process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")}/wireshark`
    : "/api/wireshark")
).replace(/\/$/, "");

const ENDPOINTS = {
  start: `${API_BASE}/start`,
  stop: `${API_BASE}/stop`,
  sessions: `${API_BASE}/sessions`,
  events: (sid) => `${API_BASE}/events/${sid}`,
  stream: (sid) => `${API_BASE}/stream/${sid}`,
};

/**
 * WireSharkViewer (Dark Theme) — env-based API
 */
export default function WireSharkViewer() {
  // Controls
  const [target, setTarget] = useState("");
  const [iface, setIface] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [running, setRunning] = useState(false);
  const esRef = useRef(null);

  // Live data
  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [packets, setPackets] = useState([]);

  // History
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hisPage, setHisPage] = useState(1);
  const [hisTotal, setHisTotal] = useState(0);
  const [hisLimit, setHisLimit] = useState(10);

  // Filters
  const [protoFilter, setProtoFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filteredPackets = useMemo(() => {
    let rows = packets;
    if (protoFilter !== "ALL") rows = rows.filter((r) => r.payload?.proto === protoFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => {
        const p = r.payload || {};
        return (
          (p.src || "").toLowerCase().includes(q) ||
          (p.dst || "").toLowerCase().includes(q) ||
          (p.info || "").toLowerCase().includes(q)
        );
      });
    }
    return rows;
  }, [packets, protoFilter, search]);

  const addEvent = (obj) => {
    setEvents((prev) => [obj, ...prev].slice(0, 2000));
    if (obj?.type === "alert") setAlerts((prev) => [obj, ...prev].slice(0, 100));
    if (obj?.type === "packet") setPackets((prev) => [obj, ...prev].slice(0, 5000));
  };

  const start = async () => {
    if (!target.trim()) return alert("Enter a target (domain or IP).");
    try {
      const res = await fetch(ENDPOINTS.start, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // if you use cookie auth on a different origin, uncomment:
        // credentials: "include",
        body: JSON.stringify({
          target: target.trim(),
          iface: iface.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to start");

      setSessionId(data.sessionId);
      setRunning(true);
      setEvents([]); setAlerts([]); setPackets([]);

      // SSE — use absolute/relative URL from env
      const es = new EventSource(ENDPOINTS.stream(data.sessionId) /* , { withCredentials: true } */);
      esRef.current = es;

      es.onmessage = (evt) => {
        try { addEvent(JSON.parse(evt.data)); }
        catch { addEvent({ type: "raw", line: evt.data, time: new Date().toISOString() }); }
      };
      es.addEventListener("end", () => { es.close(); esRef.current = null; setRunning(false); });
      es.addEventListener("error", () => { /* keep open unless server closes */ });
    } catch (e) {
      alert(e.message);
    }
  };

  const stop = async () => {
    try {
      if (!sessionId) return;
      await fetch(ENDPOINTS.stop, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials: "include",
        body: JSON.stringify({ sessionId }),
      });
    } catch {}
    finally {
      esRef.current?.close();
      esRef.current = null;
      setRunning(false);
      refreshHistory();
    }
  };

  const refreshHistory = async (page = hisPage, limit = hisLimit) => {
    try {
      setLoadingHistory(true);
      const res = await fetch(`${ENDPOINTS.sessions}?page=${page}&limit=${limit}`);
      const data = await res.json();
      setHistory(data.items || []);
      setHisTotal(data.total || 0);
      setHisPage(data.page || 1);
      setHisLimit(data.limit || 10);
    } catch {} finally {
      setLoadingHistory(false);
    }
  };

  const replaySession = async (sid) => {
    try {
      const res = await fetch(`${ENDPOINTS.events(sid)}?limit=1000`);
      const data = await res.json();
      const items = data.items || [];
      setSessionId(sid);
      setRunning(false);
      setEvents(items);
      setAlerts(items.filter((x) => x.type === "alert"));
      setPackets(items.filter((x) => x.type === "packet"));
    } catch {
      alert("Failed to load session events");
    }
  };

  const exportCsv = () => {
    const header = ["time", "proto", "src", "dst", "info", "length"];
    const rows = filteredPackets.map((ev) => {
      const p = ev.payload || {};
      return [
        ev.time || ev.createdAt || "",
        p.proto || "",
        p.src || "",
        p.dst || "",
        (p.info || "").replaceAll(",", ";"),
        p.length ?? "",
      ];
    });
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `wireshark_packets_${sessionId || "current"}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    refreshHistory(1, hisLimit);
    return () => { esRef.current?.close(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#0b1220] text-zinc-100">
      <div className="mx-auto max-w-7xl p-4 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            🦈 Wire Shark — <span className="text-zinc-300">Live Network Sniffer</span>
          </h1>
          <div className="text-xs md:text-sm text-zinc-400">
            Session: <span className="font-mono">{sessionId || "—"}</span>
          </div>
        </header>

        {/* Controls */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-lg p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Target (domain or IP) e.g. example.com or 8.8.8.8"
              className="flex-1 min-w-[260px] rounded-lg px-3 py-2 bg-zinc-900 border border-zinc-700 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <input
              value={iface}
              onChange={(e) => setIface(e.target.value)}
              placeholder="Interface (optional) e.g. eth0 / wlan0"
              className="w-56 rounded-lg px-3 py-2 bg-zinc-900 border border-zinc-700 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              onClick={start}
              disabled={running}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                running ? "bg-zinc-700 text-zinc-300 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow"
              }`}
            >
              Start
            </button>
            <button
              onClick={stop}
              disabled={!running}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                !running ? "bg-zinc-700 text-zinc-300 cursor-not-allowed"
                         : "bg-rose-600 hover:bg-rose-500 text-white shadow"
              }`}
            >
              Stop
            </button>
            <button
              onClick={exportCsv}
              className="px-4 py-2 rounded-lg font-medium border border-zinc-700 text-zinc-200 hover:bg-zinc-800/70"
            >
              Export CSV (Packets)
            </button>
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            <label className="text-sm text-zinc-400">Protocol:</label>
            <select
              value={protoFilter}
              onChange={(e) => setProtoFilter(e.target.value)}
              className="rounded-lg px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="ALL">ALL</option>
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="ICMP">ICMP</option>
              <option value="DNS">DNS</option>
              <option value="OTHER">OTHER</option>
            </select>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search src/dst/info…"
              className="flex-1 min-w-[220px] rounded-lg px-3 py-2 bg-zinc-900 border border-zinc-700 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </section>

        {/* Alerts */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Alerts</h2>
            <div className="text-sm text-zinc-400">Showing {alerts.length}</div>
          </div>
          {alerts.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-400">
              No alerts yet.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {alerts.map((a, idx) => (
                <div key={idx} className="rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-3 text-amber-200 shadow">
                  <div className="text-xs text-amber-300/80">{formatTime(a.time || a.createdAt)}</div>
                  <div className="font-medium mt-1">{a.message || a.payload?.message || "Alert"}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Packets table */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Live Packets</h2>
            <div className="text-sm text-zinc-400">
              Total: {packets.length} • Showing: {filteredPackets.length}
            </div>
          </div>
          <div className="overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/60 shadow">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/80">
                <tr className="border-b border-zinc-800">
                  <Th>Time</Th>
                  <Th>Proto</Th>
                  <Th>Source</Th>
                  <Th>Destination</Th>
                  <Th>Info</Th>
                  <Th>Length</Th>
                </tr>
              </thead>
              <tbody>
                {filteredPackets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-zinc-400">No packets to show</td>
                  </tr>
                ) : (
                  filteredPackets.slice(0, 1000).map((ev, i) => {
                    const p = ev.payload || {};
                    return (
                      <tr key={i} className="border-t border-zinc-800 hover:bg-zinc-800/40 transition">
                        <Td className="whitespace-nowrap">{formatTime(ev.time || ev.createdAt)}</Td>
                        <Td className="font-medium">{p.proto || "-"}</Td>
                        <Td className="font-mono text-zinc-300">{p.src || "-"}</Td>
                        <Td className="font-mono text-zinc-300">{p.dst || "-"}</Td>
                        <Td className="truncate max-w-[420px] text-zinc-200">{p.info || "-"}</Td>
                        <Td>{p.length ?? "-"}</Td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-zinc-500">Showing up to 1000 rows for performance. Use CSV export for full set.</div>
        </section>

        {/* History */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Session History</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refreshHistory()}
                className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800/70"
              >
                Refresh
              </button>
              <div className="text-sm text-zinc-400">Total: {hisTotal} • Page {hisPage}</div>
            </div>
          </div>

          <div className="overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/60 shadow">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/80">
                <tr className="border-b border-zinc-800">
                  <Th>Session</Th>
                  <Th>Target</Th>
                  <Th>Interface</Th>
                  <Th>Status</Th>
                  <Th>Started</Th>
                  <Th>Stopped</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {loadingHistory ? (
                  <tr><td colSpan="7" className="text-center py-6 text-zinc-400">Loading…</td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-6 text-zinc-400">No history</td></tr>
                ) : (
                  history.map((s) => (
                    <tr key={s.sessionId} className="border-t border-zinc-800 hover:bg-zinc-800/40 transition">
                      <Td className="font-mono text-zinc-300">{s.sessionId}</Td>
                      <Td className="font-mono text-zinc-300">{s.target}</Td>
                      <Td className="text-zinc-300">{s.iface || "-"}</Td>
                      <Td>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          s.status === "running" ? "bg-emerald-500/20 text-emerald-300"
                          : s.status === "error" ? "bg-rose-500/20 text-rose-300"
                          : "bg-zinc-700/60 text-zinc-300"
                        }`}>
                          {s.status}
                        </span>
                      </Td>
                      <Td className="whitespace-nowrap">{formatTime(s.startedAt)}</Td>
                      <Td className="whitespace-nowrap">{s.stoppedAt ? formatTime(s.stoppedAt) : "—"}</Td>
                      <Td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => replaySession(s.sessionId)}
                            className="px-3 py-1 rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800/70"
                          >
                            Replay
                          </button>
                          {s.status === "running" && (
                            <button
                              onClick={() => {
                                setSessionId(s.sessionId);
                                setRunning(true);
                                esRef.current?.close();
                                const es = new EventSource(ENDPOINTS.stream(s.sessionId) /* , { withCredentials: true } */);
                                esRef.current = es;
                                setEvents([]); setAlerts([]); setPackets([]);
                                es.onmessage = (evt) => {
                                  try { addEvent(JSON.parse(evt.data)); }
                                  catch { addEvent({ type: "raw", line: evt.data, time: new Date().toISOString() }); }
                                };
                                es.addEventListener("end", () => { es.close(); esRef.current = null; setRunning(false); });
                              }}
                              className="px-3 py-1 rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800/70"
                            >
                              Attach
                            </button>
                          )}
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end gap-2">
            <button
              disabled={hisPage <= 1}
              onClick={() => { const p = Math.max(1, hisPage - 1); setHisPage(p); refreshHistory(p, hisLimit); }}
              className={`px-3 py-1.5 rounded-lg border border-zinc-700 ${hisPage <= 1 ? "opacity-40 cursor-not-allowed" : "text-zinc-200 hover:bg-zinc-800/70"}`}
            >
              Prev
            </button>
            <button
              disabled={hisPage * hisLimit >= hisTotal}
              onClick={() => { const p = hisPage + 1; setHisPage(p); refreshHistory(p, hisLimit); }}
              className={`px-3 py-1.5 rounded-lg border border-zinc-700 ${(hisPage * hisLimit >= hisTotal) ? "opacity-40 cursor-not-allowed" : "text-zinc-200 hover:bg-zinc-800/70"}`}
            >
              Next
            </button>
            <select
              value={hisLimit}
              onChange={(e) => { const lim = Number(e.target.value); setHisLimit(lim); setHisPage(1); refreshHistory(1, lim); }}
              className="rounded-lg px-2 py-1 bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </section>
      </div>
    </div>
  );
}

function Th({ children, className = "" }) {
  return <th className={`text-left px-3 py-2 font-medium text-zinc-300 ${className}`}>{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-3 py-2 align-top text-zinc-200 ${className}`}>{children}</td>;
}
function formatTime(t) {
  try {
    const d = new Date(t);
    if (isNaN(d)) return "-";
    return d.toLocaleString();
  } catch {
    return "-";
  }
}
