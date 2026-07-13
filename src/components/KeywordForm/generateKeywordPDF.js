import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

const cleanStr = (val, fallback = "—") => {
  if (val === undefined || val === null || val === "") return fallback;
  return String(val);
};

// Static lookup map for Security Impact & Remediation Guidance
const SECURITY_IMPACT_MAP = {
  "High-Density Terms": {
    impact: "Excessive keyword stuffiness can trigger search engine spam filters, causing ranking demotions or algorithmic penalties.",
    remediation: "Dilute density to 1-2% by introducing semantic synonyms (LSI keywords) and focusing on natural readability."
  },
  "Low CTR Potential": {
    impact: "Poor click-through rates waste crawling resources and fail to convert search impressions into active site sessions.",
    remediation: "Refactor page title tags and meta descriptions to include active, compelling calls-to-action (CTAs) within length bounds."
  },
  "Competitor Rank Exposure": {
    impact: "Uncontested competitor ranking indicates content gaps, allowing rival sites to capture all relevant organic search traffic.",
    remediation: "Execute a competitor gap alignment strategy by targeting high-intent long-tail keywords identified in competitor rankings."
  }
};

export const generateKeywordPDF = async (report = {}, url = "") => {
  const { employeeName, employeeMail } = getAuditorInfo();
  const targetUrl = report.url || url || "-";

  // Raw arrays / state references
  const singleWords = report.singleWords || [];
  const phrases = report.phrases || [];
  const trigrams = report.trigrams || [];
  const overOptimization = report.overOptimization || [];
  const readability = report.readability || {};
  const techSeo = report.techSeo || {};
  const intents = report.intents || { informational: [], transactional: [], navigational: [] };
  const lsiSuggestions = report.lsiSuggestions || [];
  const missingKeywords = report.missingKeywords || [];
  const opportunity = report.opportunity || [];
  const benchmark = report.benchmark || { competitors: [], contentLengthVerdict: "" };
  const altSample = report.altSample || [];

  const highPriority = report.insights?.highPriority || report.highPriority || [];
  const longTail = report.insights?.longTail || report.longTail || [];
  const overlap = report.insights?.competitorOverlap || report.overlap || [];

  const totalExtracted = report.totalWords || report.insights?.totals?.totalExtracted || 0;
  const filteredSEOKeywords = report.insights?.totals?.filteredSEOKeywords || 0;
  const highDensityTerms = overOptimization.length;
  const overallOptimisationRating = readability.verdict || "Good";

  try {
    const doc = new jsPDF("p", "mm", "a4");

    const now = new Date();
    const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ════════════════════════════════════════════════════════════════════════
    // Top blue banner stripe
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    // Brand line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Keyword Density Auditor", 14, 12);

    // Company header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 105, 30, { align: "center" });

    doc.setFont("helvetica", "italic");
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
    doc.text("KEYWORD DENSITY AUDITOR", 105, 54, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TECHNICAL ASSESSMENT REPORT", 105, 60, { align: "center" });

    // Divider below title
    doc.line(14, 65, 196, 65);

    // Assessment Info table
    renderTable(doc, {
      startY: 72,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Target URL",              targetUrl],
        ["Assessment Date",         scanDate],
        ["Assessment Time",         scanTime],
        ["Classification",          "Confidential"],
        ["Assessment Status",       "Completed"],
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
    // PAGE 2 — EXECUTIVE SUMMARY & TECHNICAL SEO TAG AUDIT
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    let y = 25;

    y = drawSectionHeader(doc, "1. EXECUTIVE SUMMARY & READABILITY AUDIT", y);

    // Executive summary cards / tables
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Target Overview", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Title Tag",             report.title || "—"],
        ["Meta Description",      report.metaDescription || "—"],
        ["Total Word Count",      String(totalExtracted)],
        ["Unique Words Audited",  String(filteredSEOKeywords)],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45, fillColor: [245, 245, 245] },
        1: { cellWidth: 137 },
      },
    });
    y = doc.lastAutoTable.finalY + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Flesch-Kincaid Readability Metrics", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [["FK Score", "Grade Level", "Complexity Verdict", "Sentences Detected", "Total Syllables"]],
      body: [[
        readability.fkScore !== undefined ? String(readability.fkScore) : "—",
        readability.gradeLevel !== undefined ? String(readability.gradeLevel) : "—",
        readability.verdict || "—",
        readability.sentences !== undefined ? String(readability.sentences) : "—",
        readability.syllables !== undefined ? String(readability.syllables) : "—"
      ]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      bodyStyles: { halign: "center" }
    });
    y = doc.lastAutoTable.finalY + 12;

    y = drawSectionHeader(doc, "2. TECHNICAL SEO METRICS & HEADINGS AUDIT", y);

    renderTable(doc, {
      startY: y,
      head: [["SEO Tag Check", "Length/Count", "Status / Verdict"]],
      body: [
        ["Title Tag Character Length",      `${techSeo.titleLength || 0} Chars`,     techSeo.titleStatus || "—"],
        ["Meta Description Character Length", `${techSeo.metaDescLength || 0} Chars`,  techSeo.metaDescStatus || "—"],
        ["H1 Heading Tags Count",           `${techSeo.h1Count || 0} present`,       (techSeo.h1Count || 0) > 0 ? "Good" : "Missing H1"],
        ["H2 / H3 Header Elements Count",    `H2: ${techSeo.h2Count || 0} | H3: ${techSeo.h3Count || 0}`, "Optimal Hierarchy"],
        ["H1 Includes Top Density Keywords", techSeo.h1ContainsTop ? "Yes" : "No",    techSeo.h1ContainsTop ? "Optimal" : "Lacks Focus"],
        ["Alt Tags Containing Keywords",     `${techSeo.altWithKeywords || 0} tags`,  "SEO Configured"],
        ["Schema Markup / Structured Data",  techSeo.hasSchema ? "Present" : "Missing", techSeo.hasSchema ? "Good" : "Suggested Addition"],
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 70 },
        1: { cellWidth: 55, halign: "center" },
        2: { cellWidth: 57, halign: "center" },
      }
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — HEADINGS AND IMAGE ALT ATTRIBUTE AUDIT
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "3. HEADING TAGS & IMAGE ACCESSIBILITY AUDIT", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("HTML H1 Header Elements", 14, y);
    y += 5;

    const h1List = report.headings?.h1 || [];
    renderTable(doc, {
      startY: y,
      head: [["Index", "H1 Header Text Contents"]],
      body: h1List.length > 0 ? h1List.map((h, idx) => [String(idx + 1), h]) : [["—", "No H1 header tags detected on page"]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 15, halign: "center" },
        1: { cellWidth: 167 }
      }
    });
    y = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("HTML H2 Header Elements (Sample)", 14, y);
    y += 5;

    const h2List = report.headings?.h2 || [];
    renderTable(doc, {
      startY: y,
      head: [["Index", "H2 Header Text Contents"]],
      body: h2List.length > 0 ? h2List.slice(0, 5).map((h, idx) => [String(idx + 1), h]) : [["—", "No H2 header tags detected on page"]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 15, halign: "center" },
        1: { cellWidth: 167 }
      }
    });
    y = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Image Alt Accessibility Attributes Sample", 14, y);
    y += 5;

    const altList = altSample || [];
    renderTable(doc, {
      startY: y,
      head: [["Index", "Image Alt Text Value"]],
      body: altList.length > 0 ? altList.slice(0, 5).map((a, idx) => [String(idx + 1), a]) : [["—", "No image alt attributes detected on page"]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 15, halign: "center" },
        1: { cellWidth: 167 }
      }
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 4 — KEYWORD DENSITY ANALYSIS (SINGLE, BIGRAMS, TRIGRAMS)
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "4. DETAILED KEYWORD DENSITY MATRIX", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Top Single Keywords Density", 14, y);
    y += 5;

    const singleRows = singleWords.slice(0, 8).map(s => [
      s.phrase || "—",
      s.count !== undefined ? String(s.count) : "—",
      s.percentage !== undefined ? `${s.percentage}%` : "—"
    ]);

    renderTable(doc, {
      startY: y,
      head: [["Single Keyword / Term", "Occurrence Count", "Density Percentage"]],
      body: singleRows.length > 0 ? singleRows : [["—", "—", "—"]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      bodyStyles: { fontSize: 8.5 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 90 },
        1: { cellWidth: 42, halign: "center" },
        2: { cellWidth: 50, halign: "center" }
      }
    });
    y = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Top Two-word Phrases (Bigrams)", 14, y);
    y += 5;

    const bigramRows = phrases.slice(0, 8).map(b => [
      b.phrase || "—",
      b.count !== undefined ? String(b.count) : "—",
      b.percentage !== undefined ? `${b.percentage}%` : "—"
    ]);

    renderTable(doc, {
      startY: y,
      head: [["Two-word combination", "Occurrence Count", "Density Percentage"]],
      body: bigramRows.length > 0 ? bigramRows : [["—", "—", "—"]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      bodyStyles: { fontSize: 8.5 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 90 },
        1: { cellWidth: 42, halign: "center" },
        2: { cellWidth: 50, halign: "center" }
      }
    });
    y = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Top Three-word Phrases (Trigrams)", 14, y);
    y += 5;

    const trigramRows = trigrams.slice(0, 5).map(t => [
      t.phrase || "—",
      t.count !== undefined ? String(t.count) : "—",
      t.percentage !== undefined ? `${t.percentage}%` : "—"
    ]);

    renderTable(doc, {
      startY: y,
      head: [["Three-word combination", "Occurrence Count", "Density Percentage"]],
      body: trigramRows.length > 0 ? trigramRows : [["—", "—", "—"]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      bodyStyles: { fontSize: 8.5 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 90 },
        1: { cellWidth: 42, halign: "center" },
        2: { cellWidth: 50, halign: "center" }
      }
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 5 — SEARCH INTENT, LSI SUGGESTIONS, & MISSING KEYWORDS
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "5. SEARCH INTENT & SEMANTIC RELEVANCE", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Keyword Classification by User Intent", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [["Search Intent Bucket", "Categorized Keywords / Phrases"]],
      body: [
        ["Informational Intent", intents.informational?.length > 0 ? intents.informational.slice(0, 10).join(", ") : "None detected"],
        ["Commercial / Transactional", intents.transactional?.length > 0 ? intents.transactional.slice(0, 10).join(", ") : "None detected"],
        ["Navigational Intent", intents.navigational?.length > 0 ? intents.navigational.slice(0, 10).join(", ") : "None detected"],
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
        1: { cellWidth: 132 }
      }
    });
    y = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Latent Semantic Indexing (LSI) Keyword Suggestions", 14, y);
    y += 5;

    const lsiRows = lsiSuggestions.slice(0, 6).map(l => [
      l.keyword || "—",
      l.related && l.related.length > 0 ? l.related.join(", ") : "No synonyms found"
    ]);

    renderTable(doc, {
      startY: y,
      head: [["Top Keyword", "Suggested Semantic variations"]],
      body: lsiRows.length > 0 ? lsiRows : [["—", "—"]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      bodyStyles: { fontSize: 8.5 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
        1: { cellWidth: 132 }
      }
    });
    y = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Missing Keywords (Targets Not Found in Body Text)", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Identified Missing Targets", missingKeywords.length > 0 ? missingKeywords.join(", ") : "No missing keywords identified. Good coverage!"]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45, fillColor: [250, 240, 240] },
        1: { cellWidth: 137 }
      }
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 6 — COMPETITIVE BENCHMARKING & OPPORTUNITY SCORES
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "6. COMPETITIVE GAP ANALYSIS & TARGETING", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Competitor Content Length Benchmarking", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [["Domain / Competitor URL", "Content Word Count", "Word Count Gap Status"]],
      body: [
        ["Your Website (Target)", String(totalExtracted), "Audit Subject"],
        ...(benchmark.competitors || []).map(c => [
          c.url ? c.url.replace(/^https?:\/\//, "") : "Competitor",
          String(c.totalWords || 0),
          c.totalWords > totalExtracted ? "Competitor Content is Deeper" : "Your Content is Deeper"
        ])
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 85 },
        1: { cellWidth: 42, halign: "center" },
        2: { cellWidth: 55, halign: "center" }
      }
    });
    y = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Competitor Shared Keywords & Overlap Matrix", 14, y);
    y += 5;

    const overlapRows = overlap.slice(0, 6).map(o => [
      o.keyword || "—",
      o.rankOnYourSite !== undefined ? String(o.rankOnYourSite) : "—",
      o.rankOnCompetitor !== undefined ? String(o.rankOnCompetitor) : "—",
      o.competitorUrl ? o.competitorUrl.replace(/^https?:\/\//, "") : "Competitor"
    ]);

    renderTable(doc, {
      startY: y,
      head: [["Shared Keyword", "Your Organic Rank", "Competitor Organic Rank", "Competitor URL Reference"]],
      body: overlapRows.length > 0 ? overlapRows : [["—", "—", "—", "—"]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
        1: { cellWidth: 35, halign: "center" },
        2: { cellWidth: 40, halign: "center" },
        3: { cellWidth: 57 }
      }
    });
    y = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("High Opportunity SEO Keywords Matrix", 14, y);
    y += 5;

    const oppRows = opportunity.slice(0, 5).map(o => [
      o.keyword || "—",
      o.score !== undefined ? String(o.score) : "—",
      `Density: ${o.reasons?.density || "—"}% | Count: ${o.reasons?.count || "—"} | In Title: ${o.reasons?.inTitle ? "Yes" : "No"}`
    ]);

    renderTable(doc, {
      startY: y,
      head: [["High-Opportunity Keyword", "Priority Score", "Metrics Breakdown"]],
      body: oppRows.length > 0 ? oppRows : [["—", "—", "—"]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
        1: { cellWidth: 28, halign: "center" },
        2: { cellWidth: 104 }
      }
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 7 — RECOMMENDATIONS, ACTION PLAN, & APPENDIX
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "7. ACTION PLAN & APPENDIX", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Security & Over-Optimization Warnings", 14, y);
    y += 5;

    const overRows = overOptimization.map(o => [
      o.keyword || "—",
      o.percentage !== undefined ? `${o.percentage}%` : "—",
      o.flag || "High density"
    ]);

    renderTable(doc, {
      startY: y,
      head: [["Over-optimized Term", "Extracted Density", "Trigger / Flag Status"]],
      body: overRows.length > 0 ? overRows : [["No keyword stuffing or over-optimization flags raised.", "—", "Clean"]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      bodyStyles: { fontSize: 8.5 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60 },
        1: { cellWidth: 40, halign: "center" },
        2: { cellWidth: 82 }
      }
    });
    y = doc.lastAutoTable.finalY + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Suggested Actions", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["1", "Remove low-value and navigational keywords that do not drive meaningful organic traffic or conversions."],
        ["2", "Create dedicated content pages around high-intent, lower-difficulty keywords to improve targeted organic ranking."],
        ["3", "Optimise title tags and meta descriptions to incorporate identified high-volume, high-CTR potential keywords within recommended character limits."],
        ["4", "Build backlinks targeting long-tail keyword opportunities identified in the keyword analysis to strengthen domain authority for those terms."],
        ["5", "Review and address keyword cannibalisation where multiple pages compete for the same primary keyword."],
        ["6", "Increase keyword density for underrepresented high-value terms to meet recommended on-page SEO thresholds (1–2% density)."]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 10, halign: "center", fillColor: [245, 245, 245] },
        1: { cellWidth: 172 }
      }
    });
    y = doc.lastAutoTable.finalY + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Security Impact & Remediation Guidance", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [["Risk / Scenario", "SEO & Security Impact", "Remediation Guidance"]],
      body: [
        ["High-Density Terms", SECURITY_IMPACT_MAP["High-Density Terms"].impact, SECURITY_IMPACT_MAP["High-Density Terms"].remediation],
        ["Low CTR Potential", SECURITY_IMPACT_MAP["Low CTR Potential"].impact, SECURITY_IMPACT_MAP["Low CTR Potential"].remediation],
        ["Competitor Rank Exposure", SECURITY_IMPACT_MAP["Competitor Rank Exposure"].impact, SECURITY_IMPACT_MAP["Competitor Rank Exposure"].remediation],
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      bodyStyles: { fontSize: 7.5 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40 },
        1: { cellWidth: 72 },
        2: { cellWidth: 70 }
      }
    });
    y = doc.lastAutoTable.finalY + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement & Disclaimers", 14, y);
    y += 4;

    const ackText =
      "The findings presented in this report are based on observations made during the assessment period and represent the keyword density and SEO optimisation posture of the target web page at the time of scanning. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

    // Apply header / footer decorator
    applyHeaderFooterDecorator(doc, "Keyword Density Auditor");

    const pad = (n) => String(n).padStart(2, "0");
    const dStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    
    doc.save(`Keyword_Density_Auditor_Report_${dStr}.pdf`);

  } catch (err) {
    console.error("Failed to generate Keyword PDF:", err);
  }
};
