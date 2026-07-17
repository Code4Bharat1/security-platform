import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

const SECURITY_IMPACT_MAP = {
  vulnerable: {
    impact: "Unvalidated redirection allows attackers to redirect users to arbitrary external domains. This is heavily exploited in phishing, social engineering, and OAuth token theft attacks by masking malicious sites under trusted hostnames.",
    recommendation: "Implement strict server-side allowlists for all redirect destinations. Avoid redirecting based on user-supplied URL inputs, or force relative redirect paths only."
  },
  safe: {
    impact: "No open redirection behaviour was observed. The application either rejected external redirection URLs or successfully validated input parameters.",
    recommendation: "Maintain active inputs filtering. Ensure all future endpoint modifications follow the server-side redirection validation policies."
  }
};

const getInjectedPayloadValue = (testedUrl, paramName) => {
  try {
    const u = new URL(testedUrl);
    return u.searchParams.get(paramName) || "baseline";
  } catch (_) {
    return "baseline";
  }
};

function etldPlusOne(hostname = '') {
  const parts = (hostname || '').toLowerCase().split('.').filter(Boolean);
  if (parts.length <= 2) return parts.join('.');
  return parts.slice(-2).join('.');
}

function sameSite(a, b) {
  return etldPlusOne(a) === etldPlusOne(b);
}

const getHttpStatus = (t) => {
  if (t.chain && t.chain.length > 0) {
    const firstStatus = t.chain[0].status;
    if (typeof firstStatus === 'number') {
      return String(firstStatus);
    }
    if (typeof firstStatus === 'string' && /^\d+$/.test(firstStatus)) {
      return firstStatus;
    }
    return 'N/A';
  }
  return '200';
};

const getDisplayFinalUrl = (finalUrl) => {
  if (!finalUrl || finalUrl === "-" || finalUrl === "ERR") return "N/A";
  return finalUrl;
};

const isUnusualRedirect = (t, originalDomain) => {
  if (t.vulnerable) return true;
  if (t.chain && t.chain.length > 0) {
    const finalDomain = t.finalDomain || "";
    if (finalDomain && !sameSite(finalDomain, originalDomain)) {
      return true;
    }
  }
  return false;
};

export const generateOpenRedirectPDF = async (report = {}, setPdfProgress) => {
  if (!report) return;
  setPdfProgress?.("Initializing PDF document...");

  const { employeeName, employeeMail } = getAuditorInfo();
  const targetUrl = report.originalUrl || "N/A";
  const originalDomain = report.originalDomain || "N/A";
  const tests = report.tests || [];

  const vulnStatus = report.summary?.vulnerable ? "Vulnerable" : "Not Vulnerable";
  const overallVerdict = report.summary?.vulnerable ? "Vulnerable" : "Not Vulnerable";

  // Calculate Scan Statistics
  const paramsSet = new Set(tests.map(t => t.param));
  const parametersTested = paramsSet.size;
  const payloadsTested = tests.length;
  const isRedirect = (t) => t.chain && t.chain.length > 0 && [300, 301, 302, 303, 307, 308].includes(t.chain[0].status);
  const redirectsObserved = tests.filter(t => isRedirect(t)).length;
  const externalRedirects = tests.filter(t => {
    if (!isRedirect(t)) return false;
    const finalHost = t.finalDomain || "";
    return finalHost && !sameSite(finalHost, originalDomain);
  }).length;
  const internalRedirects = tests.filter(t => {
    if (!isRedirect(t)) return false;
    const finalHost = t.finalDomain || "";
    return finalHost && sameSite(finalHost, originalDomain);
  }).length;
  const failedRequests = tests.filter(t => !t.chain || t.chain.length === 0 || t.chain.some(h => h.status === 'ERR' || h.error)).length;
  const scanDuration = report.durationMs ? `${(report.durationMs / 1000).toFixed(2)} s` : "N/A";

  try {
    const doc = new jsPDF("p", "mm", "a4");

    // Dates
    const now = new Date();
    const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Building cover page...");

    // Top blue banner stripe
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    // Brand line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Open Redirect Tester", 14, 12);

    // Company header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 105, 30, { align: "center" });

    doc.setFont("helvetica", "oblique");
    doc.setFontSize(10);
    doc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 36, { align: "center" });

    // Divider
    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.4);
    doc.line(14, 40, 196, 40);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...C.bluePrimary);
    doc.text("OPEN REDIRECT TESTER", 105, 54, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("SECURITY ASSESSMENT REPORT", 105, 60, { align: "center" });

    // Divider below title
    doc.line(14, 65, 196, 65);

    // Assessment Info table
    renderTable(doc, {
      startY: 72,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name", employeeName],
        ["Employee Mail ID", employeeMail],
        ["Scanned URL", targetUrl],
        ["Assessment Date", scanDate],
        ["Assessment Time", scanTime],
        ["Classification", "Confidential"],
        ["Assessment Status", "Completed"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    // Cover footer
    doc.line(14, 260, 196, 260);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant", 105, 267, { align: "center" });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 2 — ASSESSMENT INFORMATION & RESULTS
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Building assessment information...");
    doc.addPage();

    let y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", 25);

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name", "Open Redirect Tester"],
        ["Tool Category", "Web Security / URL Redirection Vulnerability Scanner"],
        ["Methodology Alignment", "OWASP WSTG – OTG-CLIENT-004 / Input Validation Testing"],
        ["Compliance Alignment", "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Scanned URL", targetUrl],
        ["Assessment Mode", "Active / Automated Redirect Parameter Injection"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    y = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    const overviewText =
      "The Open Redirect Tester probes the target URL for unvalidated redirect and forward vulnerabilities by injecting external destination payloads into common redirect-related query parameters such as redirect, url, next, return, and callback. The tool evaluates the HTTP response to determine whether the application follows the injected destination without appropriate validation. Open redirect vulnerabilities are exploited in phishing campaigns and OAuth token hijacking attacks by crafting trusted-looking URLs that silently forward victims to malicious destinations. Each tested parameter is recorded alongside its injection payload, HTTP response status, and the final resolved destination URL.";
    doc.text(overviewText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    y += doc.getTextDimensions(overviewText, { maxWidth: 182 }).h + 12;

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    // Render detailed Scan Statistics Key-Value Table
    renderTable(doc, {
      startY: y,
      head: [["Scan Metric Parameter", "Observed Telemetry Value"]],
      body: [
        ["Parameters Tested", String(parametersTested)],
        ["Payloads Tested", String(payloadsTested)],
        ["Redirects Observed", String(redirectsObserved)],
        ["External Redirects (Vuln)", String(externalRedirects)],
        ["Internal Redirects", String(internalRedirects)],
        ["Failed Requests", String(failedRequests)],
        ["Scan Duration", scanDuration],
        ["Overall Verdict", overallVerdict]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 70, fillColor: [245, 245, 245] },
        1: { cellWidth: 112 }
      }
    });

    y = doc.lastAutoTable.finalY + 12;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    // --- Technology / Parameter Inventory Summary Table ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Redirection Parameters Test Matrix", 14, y);

    const testMatrixRows = tests.map(t => [
      t.param,
      getInjectedPayloadValue(t.testedUrl, t.param),
      t.vulnerable ? getDisplayFinalUrl(t.finalUrl) : (targetUrl || "N/A"),
      t.vulnerable ? (t.finalDomain || "N/A") : (originalDomain || "N/A"),
      t.vulnerable ? "Vulnerable" : "Not Vulnerable"
    ]);

    renderTable(doc, {
      startY: y + 5,
      head: [["Parameter", "Injected Payload", "Final Redirect URL", "Final Domain", "Verdict"]],
      body: testMatrixRows,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      bodyStyles: { fontSize: 8.5 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 24 },
        1: { cellWidth: 36 },
        2: { cellWidth: 56 },
        3: { cellWidth: 36 },
        4: { cellWidth: 30, halign: "center", fontStyle: "bold" }
      }
    });

    y = doc.lastAutoTable.finalY + 12;

    // Filter tests to only report Vulnerable or Unusual Redirect findings
    const detailedFindings = tests.filter(t => isUnusualRedirect(t, originalDomain));

    if (detailedFindings.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...C.bluePrimary);
      doc.text("Detailed Vulnerability Analysis", 14, y);
      y += 6;

      for (let i = 0; i < detailedFindings.length; i++) {
        const t = detailedFindings[i];
        const staticMeta = t.vulnerable ? SECURITY_IMPACT_MAP.vulnerable : SECURITY_IMPACT_MAP.safe;

        if (297 - y < 65) {
          doc.addPage();
          y = 25;
        }

        const pathwayChain = t.chain && t.chain.length > 0
          ? t.chain.map((hop, hIdx) => `Hop ${hIdx + 1}: [${hop.status || "N/A"}] Location: ${hop.location || 'None'} (${hop.url || "N/A"})`).join("\n")
          : "Direct connection (No redirection observed)";

        renderTable(doc, {
          startY: y,
          head: [],
          body: [
            ["Parameter", t.param || "N/A"],
            ["Injected Payload", getInjectedPayloadValue(t.testedUrl, t.param)],
            ["Location Header", t.chain && t.chain[0] ? (t.chain[0].location || "None") : "None"],
            ["Final Redirect URL", t.vulnerable ? getDisplayFinalUrl(t.finalUrl) : (targetUrl || "N/A")],
            ["Final Redirect Domain", t.vulnerable ? (t.finalDomain || "N/A") : (originalDomain || "N/A")],
            ["Redirect Pathway Chain", pathwayChain],
            ["Impact", staticMeta.impact],
            ["Recommendation", staticMeta.recommendation]
          ],
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
            1: { cellWidth: 127 }
          },
          margin: { left: 14, right: 14 }
        });

        y = doc.lastAutoTable.finalY + 10;
      }
    }

    // Spacing check for Section 4
    if (297 - y < 65) {
      doc.addPage();
      y = 25;
    }

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionText1 =
      "The Open Redirect Tester assessment injected external destination payloads into redirect-related parameters of the target URL to determine whether the application performs adequate validation before issuing HTTP redirects. Each parameter was tested and the resulting HTTP status code and final destination URL were recorded to confirm the presence or absence of an exploitable open redirect condition.";

    const conclusionText2 =
      "Where an open redirect vulnerability is confirmed, the application must implement a server-side allowlist of permitted redirect destinations. User-supplied redirect parameters should never be followed without strict validation against this allowlist. Relative path redirects should be preferred over absolute URL redirects wherever application design permits.";

    const conclusionText3 =
      "It is further recommended to audit all authentication and OAuth flows for redirect_uri and return_url parameters, as open redirects in these contexts can facilitate token theft and account takeover. All redirect parameters should be reviewed during code review and included in recurring automated security scans.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);

    doc.text(conclusionText1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });
    y += doc.getTextDimensions(conclusionText1, { maxWidth: 182 }).h + 6;

    doc.text(conclusionText2, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });
    y += doc.getTextDimensions(conclusionText2, { maxWidth: 182 }).h + 6;

    doc.text(conclusionText3, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });
    y += doc.getTextDimensions(conclusionText3, { maxWidth: 182 }).h + 12;

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — APPENDIX
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Building appendix...");
    doc.addPage();

    y = drawSectionHeader(doc, "5. APPENDIX", 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);

    renderTable(doc, {
      startY: y + 5,
      head: [["Column", "Description"]],
      body: [
        ["Total Parameters Tested", "Total Number of Parameters Tested"],
        ["Vulnerability Status", "Assessment outcome: Vulnerable | Not Vulnerable | Partial (domain-restricted redirect observed)"],
        ["Injected Payload", "The external URL payload injected into the parameter to test for unvalidated redirect behaviour"],
        ["Final Redirect URL", "The resolved destination URL after all redirect hops; confirms whether the application followed the injected external destination"],
        ["Final Redirect Domain", "The destination domain to which the user is ultimately redirected after all redirect chains and URL forwarding mechanisms have been processed."],
        ["Impact", "Describes the potential security consequences of exploiting the identified open redirect vulnerability, such as phishing attacks, credential theft, malware distribution, or user redirection to malicious websites."],
        ["Recommendation", "Brief summary of the scan outcome, highlighting whether the tested parameter is vulnerable and the observed redirect behavior."]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [245, 245, 245] },
        1: { cellWidth: 132 }
      }
    });

    y = doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);

    const ackText =
      "The findings presented in this report are based on observations made during the assessment period and represent the redirect validation status of the environment at the time of scanning. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply header / footer decorator
    applyHeaderFooterDecorator(doc, "Open Redirect Tester");

    setPdfProgress?.("Saving PDF...");
    const pad = (n) => String(n).padStart(2, "0");
    const dStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    doc.save(`Open_Redirect_Tester_Report_${dStr}.pdf`);

  } catch (err) {
    console.error("Failed to generate Open Redirect PDF:", err);
  } finally {
    setPdfProgress?.(null);
  }
};
