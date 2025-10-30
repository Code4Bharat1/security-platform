"use client";

import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import GreenLayout from "@/components/GreenTeam/layout";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";

const API_BASE =
  process.env.NEXT_PUBLIC_PROD_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "";
const ENDPOINT = "/keywords/generate"; // change if your route differs

export default function KeywordIntelligencePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [raw, setRaw] = useState([]);

  const [editable, setEditable] = useState(false);
  const [highPriority, setHighPriority] = useState([]);
  const [longTail, setLongTail] = useState([]);
  const [overlap, setOverlap] = useState([]);

  const protectedAction = useProtectedAction();

  const dateStr = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    []
  );

  const websiteHost = useMemo(() => {
    try {
      return url ? new URL(url).origin : "";
    } catch {
      return "";
    }
  }, [url]);

  function classifyIntent(k) {
    const s = k.toLowerCase();
    if (/(buy|price|agency|hire|company|services?|solutions?)/.test(s))
      return "Commercial";
    if (/(best|vs|comparison|deal|quote|pricing)/.test(s))
      return "Transactional";
    if (/(how|what|why|guide|tutorial|benefits|tips)/.test(s))
      return "Informational";
    return "Navigational";
  }

  function seedTables(keywords) {
    const hp = keywords
      .filter((k) => k.trim().split(/\s+/).length <= 3)
      .slice(0, 6)
      .map((k) => ({
        keyword: k,
        volume: "",
        cpc: "",
        difficulty: "",
        trend6m: "",
        intent: classifyIntent(k) || "",
      }));

    const lt = keywords
      .filter((k) => k.trim().split(/\s+/).length >= 3)
      .slice(0, 8)
      .map((k) => ({
        keyword: k,
        volume: "",
        cpc: "",
        difficulty: "",
        trend6m: "",
        intent: classifyIntent(k) || "",
      }));

    const overlapCandidates = keywords.filter((k) =>
      /(services?|solutions?)/i.test(k)
    );
    const ov = overlapCandidates.slice(0, 6).map((k) => ({
      keyword: k,
      yours: "",
      competitor: "",
    }));

    setHighPriority(hp);
    setLongTail(lt);
    setOverlap(ov);
  }

  async function analyze() {
    setError(null);

    // 1) Client-side URL validation + normalization
    let normalized = url;
    try {
      // add https:// if user typed a bare domain
      if (!/^https?:\/\//i.test(normalized))
        normalized = `https://${normalized}`;
      const u = new URL(normalized);
      if (!/^https?:$/.test(u.protocol)) throw new Error("bad");
    } catch {
      setError("Invalid URL. Please enter a full http(s) link.");
      return;
    }

    setLoading(true);
    await protectedAction(async (userToken) => {
      try {
        const r = await fetch(`${API_BASE}${ENDPOINT}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ url: normalized }), // send normalized
        });

        if (!r.ok) {
          // Try to read backend's message
          let msg = "";
          try {
            const data = await r.json();
            msg = data?.message || "";
          } catch {}
          // Friendly mapping
          const friendly =
            r.status === 400 || r.status === 404
              ? "Invalid URL. The page was not found or is unreachable."
              : msg && /invalid url|unreachable|not found/i.test(msg)
              ? "Invalid URL. The page was not found or is unreachable."
              : "please enter a valid URL.";
          setError(friendly);
          return;
        }

        const data = await r.json();

        // keep raw
        const kws = Array.isArray(data.keywords) ? data.keywords : [];
        setRaw(kws);

        // use backend tables if present
        if (Array.isArray(data.highPriority) && data.highPriority.length) {
          setHighPriority(data.highPriority);
        } else {
          seedTables(kws);
        }
        if (Array.isArray(data.longTail)) setLongTail(data.longTail);
        if (Array.isArray(data.overlap)) setOverlap(data.overlap);
      } catch (e) {
        // Network/DNS/blocked etc → show Invalid URL
        const msg = String(e?.message || "");
        if (
          /ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ETIMEDOUT|Failed to fetch|NetworkError|TypeError: Failed to fetch/i.test(
            msg
          )
        ) {
          setError("Invalid URL. The site is unreachable.");
        } else {
          setError("Sorry, something went wrong.");
        }
      } finally {
        setLoading(false);
      }
    });
  }

  function onChangeCell(rows, setRows, i, key, value) {
    const next = rows.slice();
    const row = { ...rows[i] };
    if (["volume", "cpc", "difficulty"].includes(key)) {
      row[key] = value === "" ? "" : Number(value);
    } else {
      row[key] = value;
    }
    next[i] = row;
    setRows(next);
  }

  function exportTXT() {
    const lines = [];
    lines.push(`Keyword Intelligence Report — ${dateStr}`);
    if (websiteHost) lines.push(`Website: ${websiteHost}`);
    lines.push("");
    lines.push("High-Priority Keywords:");
    highPriority.forEach((r, i) =>
      lines.push(
        `${i + 1}. ${r.keyword}  | Vol:${r.volume || "-"}  CPC:${
          r.cpc || "-"
        }  Diff:${r.difficulty || "-"}  Intent:${r.intent || "-"}`
      )
    );
    lines.push("");
    lines.push("Long-Tail Opportunities:");
    longTail.forEach((r, i) =>
      lines.push(
        `${i + 1}. ${r.keyword}  | Vol:${r.volume || "-"}  Diff:${
          r.difficulty || "-"
        }  CTR:(fill)`
      )
    );
    lines.push("");
    lines.push("Competitor Overlap:");
    overlap.forEach((r, i) =>
      lines.push(
        `${i + 1}. ${r.keyword}  | Rank on your site: ${
          r.yours || "-"
        } | Rank on competitor: ${r.competitor || "-"}`
      )
    );
    lines.push("");
    lines.push("Suggested Actions:");
    lines.push(
      "1) Remove low-value keywords and noise.",
      "2) Create content around high-intent, lower-difficulty terms.",
      "3) Optimize title/meta for top commercial terms.",
      "4) Build backlinks to long-tail opportunity pages."
    );

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "keyword-intel-report.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function exportPDF() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 40;

    doc.setFontSize(14);
    doc.text("Enhanced Industry-Level Output Structure", marginX, 48);
    doc.setFontSize(10);
    doc.text(`Keyword Intelligence Report — ${dateStr}`, marginX, 68);
    if (websiteHost) doc.text(`Website: ${websiteHost}`, marginX, 84);
    doc.text(`Total Keywords Extracted: ${raw.length}`, marginX, 100);
    doc.text(
      `Filtered SEO Keywords: ${highPriority.length + longTail.length}`,
      marginX,
      116
    );

    autoTable(doc, {
      startY: 140,
      head: [
        [
          "Keyword",
          "Search Volume",
          "CPC (USD)",
          "Difficulty (%)",
          "Trend (6 mo)",
          "Intent",
        ],
      ],
      body: highPriority.map((r) => [
        r.keyword,
        r.volume || "—",
        r.cpc || "—",
        r.difficulty || "—",
        r.trend6m || "—",
        r.intent || "—",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fontStyle: "bold" },
      margin: { left: marginX, right: marginX },
      theme: "grid",
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 22,
      head: [["Keyword", "Search Volume", "Difficulty (%)", "CTR Potential"]],
      body: longTail.map((r) => [
        r.keyword,
        r.volume || "—",
        r.difficulty || "—",
        "—",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fontStyle: "bold" },
      margin: { left: marginX, right: marginX },
      theme: "grid",
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 22,
      head: [["Keyword", "Rank on Your Site", "Rank on Competitor"]],
      body: overlap.map((r) => [
        r.keyword,
        r.yours || "—",
        r.competitor || "—",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fontStyle: "bold" },
      margin: { left: marginX, right: marginX },
      theme: "grid",
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 22,
      head: [["Suggested Actions"]],
      body: [
        ["1. Remove low-value keywords."],
        ["2. Create content around high-intent, lower-difficulty keywords."],
        ["3. Optimize title/meta for top commercial-intent keywords."],
        ["4. Build backlinks targeting long-tail opportunities."],
      ],
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fontStyle: "bold" },
      margin: { left: marginX, right: marginX },
      theme: "grid",
    });

    doc.save("keyword-intel-report.pdf");
  }

  const hasData = highPriority.length + longTail.length > 0;

  return (
    <div className="min-h-screen bg-black text-slate-100">
      <GreenLayout
        heroData={{
          imgPath: "/GreenTeam/keyword-generate.png",
          title: "Keyword Intelligence Report",
          desc: "Generate a comprehensive keyword intelligence report for your website, complete with actionable insights to boost your SEO strategy.",
        }}
      />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="text-sm text-slate-400">
          📊 Keyword Generation {dateStr}
        </div>

        <section className="rounded-2xl border border-white bg-[#0f1523] p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col md:flex-row gap-3 md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-slate-300">
                Website URL
              </label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <button
              onClick={analyze}
              disabled={loading || !url}
              className="h-10 px-4 rounded-lg bg-green-600 hover:bg-green-500 text-white focus:outline-none focus:ring-2 focus:ring-green-500/40"
            >
              {loading ? "Generating..." : "Generate"}
            </button>

            <button
              onClick={() => setEditable((v) => !v)}
              disabled={!hasData}
              className="h-10 px-4 rounded-lg border border-slate-700 bg-green-600 hover:bg-green-500 text-white"
            >
              {editable ? "Lock Editing" : "Edit Metrics"}
            </button>

            <button
              onClick={exportTXT}
              disabled={!hasData}
              className="h-10 px-4 rounded-lg border border-slate-700 bg-green-600 hover:bg-green-500 text-white"
            >
              Export TXT
            </button>

            <button
              onClick={exportPDF}
              disabled={!hasData}
              className="h-10 px-4 rounded-lg bg-green-600 hover:bg-green-500 text-white"
            >
              Export PDF
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-400">Error: {error}</p>}

          {hasData && (
            <div className="mt-6 space-y-10">
              <div className="text-sm text-slate-400">
                Website:{" "}
                <span className="font-medium text-slate-200">
                  {websiteHost || "—"}
                </span>{" "}
                • Total Keywords:{" "}
                <span className="font-medium text-slate-200">{raw.length}</span>{" "}
                • Filtered SEO Keywords:{" "}
                <span className="font-medium text-slate-200">
                  {highPriority.length + longTail.length}
                </span>
              </div>

              <TableHP
                rows={highPriority}
                editable={editable}
                onChange={(i, key, val) =>
                  onChangeCell(highPriority, setHighPriority, i, key, val)
                }
              />

              <TableLT
                rows={longTail}
                editable={editable}
                onChange={(i, key, val) =>
                  onChangeCell(longTail, setLongTail, i, key, val)
                }
              />

              <TableOverlap
                rows={overlap}
                editable={editable}
                onChange={(i, key, val) => {
                  const next = overlap.slice();
                  next[i] = {
                    ...next[i],
                    [key]: val === "" ? "" : Number(val),
                  };
                  setOverlap(next);
                }}
              />

              <div>
                <h2 className="text-lg font-semibold mb-2">
                  ✍️ Suggested Actions
                </h2>
                <ol className="list-decimal pl-5 text-sm space-y-1 text-slate-300">
                  <li>Remove low-value keywords (menus, UI labels, noise).</li>
                  <li>
                    Create content around high-volume, lower-difficulty
                    keywords.
                  </li>
                  <li>Optimize title/meta for top commercial-intent terms.</li>
                  <li>Build backlinks targeting long-tail opportunities.</li>
                </ol>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ---------- Shared dark table styles ---------- */

const theadCls =
  "bg-slate-800/70 text-slate-200 [&>tr>th]:px-3 [&>tr>th]:py-2 [&>tr>th]:font-semibold [&>tr>th]:text-left";
const rowCls =
  "border-t border-slate-800 hover:bg-slate-900/60 transition-colors [&>td]:px-3 [&>td]:py-2";
const inputCls =
  "w-24 border border-slate-700 bg-slate-900 text-slate-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/30";
const inputSmCls =
  "w-20 border border-slate-700 bg-slate-900 text-slate-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/30";
const selectCls =
  "border border-slate-700 bg-slate-900 text-slate-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/30";

function TableHP({ rows, editable, onChange }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">🔥 High-Priority Keywords</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm rounded-xl overflow-hidden border border-slate-800">
          <thead className={theadCls}>
            <tr>
              <th>Keyword</th>
              <th>Search Volume</th>
              <th>CPC (USD)</th>
              <th>Difficulty (%)</th>
              <th>Trend (6 mo)</th>
              <th>Intent</th>
            </tr>
          </thead>
          <tbody className="text-slate-200">
            {rows.map((r, i) => (
              <tr key={i} className={rowCls}>
                <td className="font-medium">{r.keyword}</td>
                <td>
                  {editable ? (
                    <input
                      type="number"
                      className={inputCls}
                      value={r.volume}
                      onChange={(e) => onChange(i, "volume", e.target.value)}
                    />
                  ) : (
                    r.volume || "—"
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      type="number"
                      step="0.01"
                      className={inputSmCls}
                      value={r.cpc}
                      onChange={(e) => onChange(i, "cpc", e.target.value)}
                    />
                  ) : (
                    r.cpc || "—"
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      type="number"
                      className={inputSmCls}
                      value={r.difficulty}
                      onChange={(e) =>
                        onChange(i, "difficulty", e.target.value)
                      }
                    />
                  ) : (
                    r.difficulty || "—"
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      className={inputCls}
                      placeholder="↗, ↘, ↔"
                      value={r.trend6m || ""}
                      onChange={(e) => onChange(i, "trend6m", e.target.value)}
                    />
                  ) : (
                    r.trend6m || "—"
                  )}
                </td>
                <td>
                  {editable ? (
                    <select
                      className={selectCls}
                      value={r.intent || ""}
                      onChange={(e) => onChange(i, "intent", e.target.value)}
                    >
                      <option value="">—</option>
                      <option>Commercial</option>
                      <option>Transactional</option>
                      <option>Informational</option>
                      <option>Navigational</option>
                    </select>
                  ) : (
                    r.intent || "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableLT({ rows, editable, onChange }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">
        💡 Long-Tail Keyword Opportunities
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm rounded-xl overflow-hidden border border-slate-800">
          <thead className={theadCls}>
            <tr>
              <th>Keyword</th>
              <th>Search Volume</th>
              <th>Difficulty (%)</th>
              <th>CTR Potential</th>
            </tr>
          </thead>
          <tbody className="text-slate-200">
            {rows.map((r, i) => (
              <tr key={i} className={rowCls}>
                <td className="font-medium">{r.keyword}</td>
                <td>
                  {editable ? (
                    <input
                      type="number"
                      className={inputCls}
                      value={r.volume}
                      onChange={(e) => onChange(i, "volume", e.target.value)}
                    />
                  ) : (
                    r.volume || "—"
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      type="number"
                      className={inputSmCls}
                      value={r.difficulty}
                      onChange={(e) =>
                        onChange(i, "difficulty", e.target.value)
                      }
                    />
                  ) : (
                    r.difficulty || "—"
                  )}
                </td>
                <td className="text-slate-400">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableOverlap({ rows, editable, onChange }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">📌 Competitor Overlap</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm rounded-xl overflow-hidden border border-slate-800">
          <thead className={theadCls}>
            <tr>
              <th>Keyword</th>
              <th>Rank on Your Site</th>
              <th>Rank on Competitor (ABC.com)</th>
            </tr>
          </thead>
          <tbody className="text-slate-200">
            {rows.map((r, i) => (
              <tr key={i} className={rowCls}>
                <td className="font-medium">{r.keyword}</td>
                <td>
                  {editable ? (
                    <input
                      type="number"
                      className={inputCls}
                      value={r.yours}
                      onChange={(e) => onChange(i, "yours", e.target.value)}
                    />
                  ) : (
                    r.yours || "—"
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      type="number"
                      className={inputCls}
                      value={r.competitor}
                      onChange={(e) =>
                        onChange(i, "competitor", e.target.value)
                      }
                    />
                  ) : (
                    r.competitor || "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
