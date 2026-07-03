"use client";
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

export default function XssTester() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [payloadCount, setPayloadCount] = useState(null); // fetched from backend on mount
  const [payloadLoading, setPayloadLoading] = useState(true);

  const protectedAction = useProtectedAction();

  const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, "");

  // ─── Fetch payload count from backend on mount ───────────────────────────────
  useEffect(() => {
    const fetchPayloads = async () => {
      try {
        const tokenRaw =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const token = tokenRaw ? tokenRaw.replace(/^"|"$/g, "") : "";
        const res = await fetch(`${apiBase}/xssTester/payloads`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPayloadCount(data.count ?? 0);
        }
      } catch {
        // silently fail — scan will still work; backend loads payloads internally
      } finally {
        setPayloadLoading(false);
      }
    };
    fetchPayloads();
  }, [apiBase]);

  // ─── Run scan ─────────────────────────────────────────────────────────────────
  const handleTest = async (e) => {
    e?.preventDefault?.();
    setResult(null);
    setLoading(true);

    await protectedAction(async (token) => {
      try {
        const res = await fetch(`${apiBase}/xssTester/xssTester-scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            url,
            domScan: true,
            takeScreenshots: true,
            autoBypass: true,
          }),
        });

        const data = await res.json();
        setResult(data);
      } catch (err) {
        setResult({ error: String(err) });
      }
    });

    setLoading(false);
  };

  // ─── PDF Export ───────────────────────────────────────────────────────────────
  const makePdf = () => {
    if (!result) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    const drawHeaderBanner = (d, titleText = "NEXCORE ALLIANCE  |  Individual Tool Report – XSS Tester") => {
      d.setFillColor(18, 18, 18);
      d.rect(0, 0, pageWidth, 15, "F");
      d.setFillColor(197, 160, 89);
      d.rect(0, 14.5, pageWidth, 0.5, "F");
      d.setFont("helvetica", "bold");
      d.setFontSize(10);
      d.setTextColor(197, 160, 89);
      d.text(titleText, 15, 10);
    };

    const drawPage1FooterBanner = (d) => {
      d.setFillColor(18, 18, 18);
      d.rect(0, pageHeight - 20, pageWidth, 15, "F");
      d.setFillColor(197, 160, 89);
      d.rect(0, pageHeight - 20, pageWidth, 0.5, "F");
      d.setFont("helvetica", "normal");
      d.setFontSize(9);
      d.setTextColor(255, 255, 255);
      d.text("www.nexcorealliance.com  |  ISO/IEC 27001 Certified  |  AICPA SOC Compliant", pageWidth / 2, pageHeight - 10, { align: "center" });
    };

    const drawPageFooter = (d, pageNum) => {
      d.setFont("helvetica", "normal");
      d.setFontSize(8.5);
      d.setTextColor(107, 114, 128);
      d.text(`Confidential | www.nexcorealliance.com | Page ${pageNum}`, pageWidth / 2, pageHeight - 12, { align: "center" });
    };

    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const loggedInUser = userStr ? JSON.parse(userStr) : null;
    const empName = result.user?.name || loggedInUser?.name || "Employee Name";
    const empMail = result.user?.email || loggedInUser?.email || "Employee Mail ID";

    const assessmentDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const assessmentTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    const detectedParamStr = (result.detectedParams || []).join(", ") || "q";

    // PAGE 1: COVER PAGE
    drawHeaderBanner(doc);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(197, 160, 89);
    doc.text("NEXCORE ALLIANCE", pageWidth / 2, 60, { align: "center" });
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(100, 110, 120);
    doc.text("AI-Powered Cybersecurity & Information Security Solutions", pageWidth / 2, 67, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(18, 18, 18);
    doc.text("XSS TESTER SECURITY ASSESSMENT REPORT", pageWidth / 2, 90, { align: "center" });

    autoTable(doc, {
      startY: 110,
      head: [],
      body: [
        ["Assessment Performed by", `(${empMail})`],
        ["Employee Name", `(${empName})`],
        ["Employee Mail ID", `(${empMail})`],
        ["Scanned URL", `(${url || "Target URL"})`],
        ["Assessment Date", `(${assessmentDate})`],
        ["Assessment Time", `(${assessmentTime})`],
        ["Classification", "Confidential"],
        ["Assessment Status", "Completed"],
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 4.5, textColor: [31, 41, 55] },
      columnStyles: {
        0: { fontStyle: "bold", fillColor: [243, 244, 246], cellWidth: 60 },
        1: { cellWidth: 120 },
      },
      margin: { left: 15, right: 15 },
    });

    drawPage1FooterBanner(doc);

    // PAGE 2: ASSESSMENT INFORMATION
    doc.addPage();
    drawHeaderBanner(doc);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(18, 18, 18);
    doc.text("1. ASSESSMENT INFORMATION", 15, 30);
    doc.setDrawColor(197, 160, 89);
    doc.setLineWidth(0.5);
    doc.line(15, 32, pageWidth - 15, 32);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(197, 160, 89);
    doc.text("Tool Details", 15, 42);

    autoTable(doc, {
      startY: 46,
      head: [],
      body: [
        ["Tool Name", "XSS Tester"],
        ["Tool Category", "Web Application Security / Injection Testing"],
        ["Methodology Alignment", "OWASP WSTG – OTG-INPVAL-001 / OTG-INPVAL-002\n(Reflected & Stored XSS Testing)"],
        ["Compliance Alignment", "ISO/IEC 27001  |  AICPA SOC Frameworks"],
        ["Scanned URL", `(${url || "Target URL"})`],
        ["Assessment Mode", "Non-Intrusive / Automated Payload Injection"],
      ],
      theme: "grid",
      styles: { fontSize: 9.5, cellPadding: 4, textColor: [31, 41, 55] },
      columnStyles: {
        0: { fontStyle: "bold", fillColor: [243, 244, 246], cellWidth: 50 },
        1: { cellWidth: 130 },
      },
      margin: { left: 15, right: 15 },
    });

    let overviewY = doc.lastAutoTable.finalY + 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(197, 160, 89);
    doc.text("Tool Overview", 15, overviewY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81);
    const overviewText =
      "The XSS Tester tool performs automated Cross-Site Scripting (XSS) assessments against target web application parameters by injecting a defined set of payloads into user-controllable input fields. Parameters are automatically detected from the submitted URL. Each injected payload is evaluated for reflection in the HTTP response, and the reflection context (HTML body, attribute, JavaScript, or URL) is recorded to determine exploitability. Severity is calculated based on reflection outcome and context, producing an actionable finding set that distinguishes confirmed vulnerabilities from non-reflective parameter responses.";
    const splitOverview = doc.splitTextToSize(overviewText, pageWidth - 30);
    doc.text(splitOverview, 15, overviewY + 6);
    drawPageFooter(doc, 2);

    // PAGE 3: SCAN SUMMARY & FINDINGS
    doc.addPage();
    drawHeaderBanner(doc);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(18, 18, 18);
    doc.text("2. SCAN SUMMARY", 15, 30);
    doc.setDrawColor(197, 160, 89);
    doc.line(15, 32, pageWidth - 15, 32);

    const runsList = result.runs || [];
    const totalPayloads = runsList.length;
    const vulnerableRuns = runsList.filter((r) => r.reflected || r.domExecuted);
    const vulnerableCount = vulnerableRuns.length;
    const safeCount = totalPayloads - vulnerableCount;

    let overallRisk = "Informational";
    if (runsList.some((r) => r.risk === "High")) overallRisk = "High";
    else if (runsList.some((r) => r.risk === "Medium")) overallRisk = "Medium";
    else if (runsList.some((r) => r.risk === "Low")) overallRisk = "Low";

    autoTable(doc, {
      startY: 38,
      head: [["Total Parameters Tested", "Total Payloads Injected", "Reflected (Vulnerable)", "Not Reflected (Safe)", "Overall Risk Rating"]],
      body: [[
        String((result.detectedParams || []).length || 1),
        String(totalPayloads),
        String(vulnerableCount),
        String(safeCount),
        overallRisk,
      ]],
      theme: "grid",
      headStyles: { fillColor: [18, 18, 18], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
      styles: { fontSize: 9.5, cellPadding: 5, halign: "center", textColor: [31, 41, 55] },
      margin: { left: 15, right: 15 },
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(197, 160, 89);
    doc.text("Assessment Result", 15, doc.lastAutoTable.finalY + 10);

    const vulnParams = [...new Set(vulnerableRuns.map((r) => r.param).filter(Boolean))];

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 14,
      head: [],
      body: [
        ["Parameters in Scope", detectedParamStr],
        ["XSS Vulnerability Status", vulnerableCount > 0 ? "Vulnerable" : "Secure"],
        ["Confirmed Vulnerable Parameters", vulnerableCount > 0 ? (vulnParams.join(", ") || detectedParamStr) : "None"],
      ],
      theme: "grid",
      styles: { fontSize: 9.5, cellPadding: 4.5, textColor: [31, 41, 55] },
      columnStyles: {
        0: { fontStyle: "bold", fillColor: [243, 244, 246], cellWidth: 60 },
        1: { cellWidth: 120 },
      },
      margin: { left: 15, right: 15 },
    });

    // Section 3: Detailed Findings
    let findingsY = doc.lastAutoTable.finalY + 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(18, 18, 18);
    doc.text("3. DETAILED FINDINGS", 15, findingsY);
    doc.setDrawColor(197, 160, 89);
    doc.line(15, findingsY + 2, pageWidth - 15, findingsY + 2);

    const getRec = (context) => {
      if (context === "html") return "Sanitize user input; HTML entity encoding.";
      if (context === "javascript") return "Use safe JS APIs; escape quotes; strict CSP.";
      if (context === "attribute") return "Encode HTML attributes; double quote attributes.";
      if (context === "url") return "Sanitize URL parameters; validate protocol.";
      return "No remediation required.";
    };

    const getCalc = (run) => {
      if (run.domExecuted) return "DOM Execution detected";
      if (run.reflected) return `Reflected in ${run.context || "HTML"}`;
      return "No execution or reflection";
    };

    const detailedRows = runsList.map((r, idx) => [
      r.risk || "None",
      r.param || "—",
      idx + 1,
      r.payload,
      r.reflected ? "Reflected" : "Not Reflected",
      r.context || "None",
      getCalc(r),
      getRec(r.context),
    ]);

    autoTable(doc, {
      startY: findingsY + 6,
      head: [["Severity", "Parameter", "Payload #", "Tested Payload", "Reflection Result", "Reflection Context", "Severity Calculation", "Recommendation"]],
      body: detailedRows,
      theme: "grid",
      headStyles: { fillColor: [18, 18, 18], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5 },
      styles: { fontSize: 7.5, cellPadding: 3, textColor: [31, 41, 55] },
      columnStyles: {
        3: { cellWidth: 35 },
        6: { cellWidth: 32 },
        7: { cellWidth: 35 },
      },
      margin: { left: 15, right: 15 },
      didDrawPage: (data) => {
        if (data.pageNumber > 2) {
          drawHeaderBanner(doc);
          drawPageFooter(doc, data.pageNumber);
        }
      },
    });

    // PAGE 4: CONCLUSION & RECOMMENDATIONS
    let conclusionY = doc.lastAutoTable.finalY + 12;
    if (conclusionY > pageHeight - 80) {
      doc.addPage();
      drawHeaderBanner(doc);
      conclusionY = 30;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(18, 18, 18);
    doc.text("4. CONCLUSION & RECOMMENDATIONS", 15, conclusionY);
    doc.setDrawColor(197, 160, 89);
    doc.line(15, conclusionY + 2, pageWidth - 15, conclusionY + 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81);

    const p1 = "The XSS Tester assessment automatically detected and injected a structured payload set across all query parameters of the target web application. Each parameter was evaluated for payload reflection, and the reflection context was analysed to determine exploitability and assign a severity rating. Parameters that returned injected payloads unmodified within HTML body, attribute, or JavaScript contexts were classified as confirmed XSS vulnerabilities.";
    const p2 = "Reflected XSS vulnerabilities allow adversaries to craft malicious URLs that, when visited by an authenticated user, execute attacker-controlled scripts within the victim's browser session. This can result in session token theft, credential harvesting, defacement, and redirection to malicious resources. High and Critical severity findings should be prioritised for immediate remediation.";
    const p3 = "It is recommended to implement strict output encoding for all user-supplied input rendered in HTML, JavaScript, and URL contexts using context-aware encoding libraries. A Content Security Policy (CSP) header should be enforced to restrict script execution to trusted sources. Input validation should be applied at the server side to reject or sanitise payloads containing script injection characters. The HttpOnly and Secure flags must be set on all session cookies to limit the impact of any successful XSS exploitation. All parameters identified as vulnerable in Section 3 should be remediated and re-tested prior to next release.";

    let textY = conclusionY + 8;
    doc.text(doc.splitTextToSize(p1, pageWidth - 30), 15, textY);
    textY += doc.splitTextToSize(p1, pageWidth - 30).length * 5 + 5;
    doc.text(doc.splitTextToSize(p2, pageWidth - 30), 15, textY);
    textY += doc.splitTextToSize(p2, pageWidth - 30).length * 5 + 5;
    doc.text(doc.splitTextToSize(p3, pageWidth - 30), 15, textY);

    const pageCountForConclusion = doc.internal.getNumberOfPages();
    drawPageFooter(doc, pageCountForConclusion);

    // PAGE 5: APPENDIX
    doc.addPage();
    drawHeaderBanner(doc);
    const appendixPageNum = doc.internal.getNumberOfPages();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(18, 18, 18);
    doc.text("5. APPENDIX", 15, 30);
    doc.setDrawColor(197, 160, 89);
    doc.line(15, 32, pageWidth - 15, 32);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(197, 160, 89);
    doc.text("Column Reference Guide", 15, 42);

    autoTable(doc, {
      startY: 46,
      head: [["Column", "Description"]],
      body: [
        ["Severity", "Risk level assigned to the finding: Critical / High / Medium / Low / Informational"],
        ["Parameter", "The input parameter name automatically detected from the URL (e.g., q, search, id)"],
        ["Payload", "Sequential identifier for the injected test payload"],
        ["Tested Payload", "The exact XSS payload string injected into the parameter during testing"],
        ["Reflection Result", "Outcome of the payload injection: Reflected (Vulnerable) / Not Reflected (Safe)"],
        ["Reflection Context", "The response context in which the payload was reflected: HTML Body / HTML Attribute / JavaScript / URL"],
        ["Severity Calculation", "Basis for severity assignment: considers reflection outcome, context exploitability, and encoding applied by the application"],
        ["Recommendation", "Specific, actionable remediation guidance aligned to the identified XSS vulnerability and reflection context"],
      ],
      theme: "grid",
      headStyles: { fillColor: [18, 18, 18], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 8.5, cellPadding: 4, textColor: [31, 41, 55] },
      columnStyles: {
        0: { fontStyle: "bold", fillColor: [243, 244, 246], cellWidth: 50 },
        1: { cellWidth: 130 },
      },
      margin: { left: 15, right: 15 },
    });

    let ackY = doc.lastAutoTable.finalY + 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(18, 18, 18);
    doc.text("Acknowledgement", 15, ackY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81);
    const ackText =
      "The findings presented in this report are based on observations made during the assessment period and represent the XSS vulnerability posture of the environment at the time of scanning. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";
    doc.text(doc.splitTextToSize(ackText, pageWidth - 30), 15, ackY + 6);
    drawPageFooter(doc, appendixPageNum);

    doc.save("xss-report.pdf");
  };

  // ─── JSON Download ────────────────────────────────────────────────────────────
  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const urlObj = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlObj;
    a.download = "xss-report.json";
    a.click();
    URL.revokeObjectURL(urlObj);
  };

  // ─── Risk badge helper ────────────────────────────────────────────────────────
  const riskBadge = (risk) => {
    const map = {
      High: "text-red-400 bg-red-900/30 border border-red-700",
      Medium: "text-yellow-400 bg-yellow-900/30 border border-yellow-700",
      Low: "text-blue-400 bg-blue-900/30 border border-blue-700",
      None: "text-gray-400 bg-gray-800 border border-gray-700",
    };
    return map[risk] || map.None;
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="tool-detail-page min-h-screen bg-black text-white">
      <div className="tool-detail-shell max-w-4xl mx-auto p-6 space-y-6">

        {/* ── Header ── */}
        <div className="tool-detail-hero flex items-center gap-4 mb-8">
          <div className="w-30 h-30 sm:w-24 md:w-30 sm:h-24 md:h-30 bg-white rounded-full flex items-center justify-center border-4 border-red-600 overflow-hidden flex-shrink-0">
            <img src="/Redteam/xss.png" alt="XSS Scanner Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Advanced XSS Scanner</h1>
            <p className="text-gray-400 text-sm">Identify Cross-Site Scripting (XSS) risks</p>
          </div>
        </div>

        <div className="space-y-5">

          {/* ── URL Input card ── */}
          <div className="bg-blue-900/20 rounded-lg p-6 border border-white/20">
            <label htmlFor="xss-url-input" className="block text-white font-medium mb-2">
              Target URL
            </label>
            <input
              id="xss-url-input"
              type="url"
              placeholder="e.g., https://site.com/search?id=1&query=test"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors"
              required
            />

            {/* ── Auto-detect info banner ── */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {/* Parameter auto-detection pill */}
              <div className="flex items-center gap-2 bg-gray-800/60 border border-gray-600 rounded-full px-4 py-1.5 text-sm">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-gray-300">
                  Parameters auto-detected from URL
                  <span className="text-gray-500 ml-1">(defaults to <code className="text-red-400">q</code> if none found)</span>
                </span>
              </div>

              {/* Payload count pill */}
              <div className="flex items-center gap-2 bg-gray-800/60 border border-gray-600 rounded-full px-4 py-1.5 text-sm">
                {payloadLoading ? (
                  <span className="text-gray-400 animate-pulse">Loading payloads…</span>
                ) : payloadCount !== null ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="text-gray-300">
                      <span className="text-red-400 font-semibold">{payloadCount}</span> payloads loaded from backend
                    </span>
                  </>
                ) : (
                  <span className="text-gray-400">Payloads: backend-managed</span>
                )}
              </div>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              type="button"
              id="xss-run-scan-btn"
              onClick={handleTest}
              disabled={loading || !url.trim()}
              className={`px-8 py-3 text-white rounded-lg font-medium transition-all shadow-lg ${
                loading || !url.trim()
                  ? "bg-red-400 cursor-not-allowed opacity-60"
                  : "bg-red-600 hover:bg-red-700 hover:shadow-red-900/40 hover:shadow-xl"
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Scanning…
                </span>
              ) : (
                "Run Scan"
              )}
            </button>

            {result && !result.error && (
              <>
                <button
                  type="button"
                  id="xss-download-pdf-btn"
                  onClick={makePdf}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-all hover:shadow-lg"
                >
                  Download PDF Report
                </button>
                <button
                  type="button"
                  id="xss-download-json-btn"
                  onClick={downloadJson}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium transition-all hover:shadow-lg"
                >
                  Download JSON
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Results Section ── */}
        {result && (
          <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
            <h2 className="font-semibold text-xl mb-4 text-white">Scan Results</h2>

            {!result.error ? (
              <>
                {/* ── Detected Parameters Banner ── */}
                {result.detectedParams?.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-2 items-center">
                    <span className="text-gray-400 text-sm">Parameters tested:</span>
                    {result.detectedParams.map((p) => (
                      <span
                        key={p}
                        className="px-3 py-1 bg-red-900/30 border border-red-700 text-red-300 rounded-full text-xs font-mono"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}

                {/* ── Summary Strip ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Total Tests", value: result.summary?.total ?? "—", color: "text-white" },
                    { label: "High Risk", value: result.summary?.high ?? 0, color: "text-red-400" },
                    { label: "Medium Risk", value: result.summary?.medium ?? 0, color: "text-yellow-400" },
                    { label: "Low Risk", value: result.summary?.low ?? 0, color: "text-blue-400" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-gray-800 rounded-lg p-3 text-center">
                      <div className={`text-2xl font-bold ${color}`}>{value}</div>
                      <div className="text-gray-400 text-xs mt-1">{label}</div>
                    </div>
                  ))}
                </div>

                {/* WAF / Rate-limit info */}
                <div className="text-sm text-gray-400 space-y-1 mb-5">
                  <div>
                    WAF:{" "}
                    <span className={result.waf?.detected ? "text-yellow-400" : "text-green-400"}>
                      {result.waf?.detected ? `Detected (${result.waf?.vendor || "unknown"})` : "Not detected"}
                    </span>
                  </div>
                  <div>
                    Rate Limiting:{" "}
                    <span className={result.rateLimit?.detected ? "text-yellow-400" : "text-green-400"}>
                      {result.rateLimit?.detected ? `Yes (${result.rateLimit?.reason})` : "Not detected"}
                    </span>
                  </div>
                </div>

                {/* ── Results Table ── */}
                <div className="overflow-auto rounded-lg border border-white/10">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-800">
                      <tr className="text-left">
                        <th className="py-3 px-3 text-gray-300 font-medium">#</th>
                        <th className="py-3 px-3 text-gray-300 font-medium">Parameter</th>
                        <th className="py-3 px-3 text-gray-300 font-medium">Payload</th>
                        <th className="py-3 px-3 text-gray-300 font-medium">Context</th>
                        <th className="py-3 px-3 text-gray-300 font-medium">Reflected</th>
                        <th className="py-3 px-3 text-gray-300 font-medium">DOM Exec</th>
                        <th className="py-3 px-3 text-gray-300 font-medium">Risk</th>
                        <th className="py-3 px-3 text-gray-300 font-medium">HTTP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(result.runs || []).map((r, i) => (
                        <tr
                          key={i}
                          className="border-t border-white/5 align-top hover:bg-gray-800/60 transition-colors"
                        >
                          <td className="py-2.5 px-3 text-gray-400">{i + 1}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 bg-gray-700 text-gray-200 rounded font-mono text-xs">
                              {r.param || "—"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono break-all text-gray-100 max-w-xs text-xs">
                            {r.payload}
                          </td>
                          <td className="py-2.5 px-3 text-gray-300 text-xs">{r.context || "—"}</td>
                          <td className="py-2.5 px-3 text-xs">
                            {r.reflected ? (
                              <span className="text-red-400 font-semibold">Yes</span>
                            ) : (
                              <span className="text-gray-500">No</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-xs">
                            {r.domExecuted ? (
                              <span className="text-red-400 font-semibold">Yes</span>
                            ) : (
                              <span className="text-gray-500">No</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-xs">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${riskBadge(r.risk)}`}>
                              {r.risk || "—"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-gray-400 text-xs">{r.status || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── Reflection Highlight (first hit) ── */}
                {(result.runs || []).some((r) => r.reflection?.highlighted) && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-white mb-3">Reflected Payload Highlight</h3>
                    {(result.runs || [])
                      .filter((r) => r.reflection?.highlighted)
                      .slice(0, 1)
                      .map((r, idx) => (
                        <pre
                          key={idx}
                          className="bg-gray-800 border border-white/10 rounded-lg p-4 overflow-auto text-xs whitespace-pre-wrap text-gray-200"
                        >
                          {r.reflection?.highlighted}
                        </pre>
                      ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-800">
                {String(result.error)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
