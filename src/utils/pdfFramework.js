import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ── Shared Design System Color Tokens ─────────────────────────────────────
export const C = {
  bg:          [255, 255, 255],     // Page background: white
  bgAlt:       [248, 249, 250],     // Alternate rows: light grey
  bgHeader:    [13, 56, 115],       // Header box background: dark blue
  bluePrimary: [13, 56, 115],       // Primary text / box: dark blue
  white:       [255, 255, 255],
  black:       [0, 0, 0],
  textMain:    [40, 40, 40],        // Dark grey main text
  textMuted:   [110, 110, 110],     // Light grey caption text
  lineColor:   [210, 210, 210],     // Table border lines
  red:         [220, 53, 69],       // High severity
  amber:       [253, 126, 20],      // Medium severity
  blue:        [13, 110, 253],      // Low severity
  purple:      [111, 66, 193],      // Critical severity
  gray:        [110, 110, 110],     // Info severity
};

// Safe string utility
export const safe = (v, fallback = "—") =>
  v !== undefined && v !== null && v !== "" ? String(v) : fallback;

// Dynamic severity coloring utility
export const getSeverityColor = (sev) => {
  switch ((sev || "").toLowerCase()) {
    case "critical": return C.purple;
    case "high":     return C.red;
    case "medium":   return C.amber;
    case "low":      return C.blue;
    default:         return C.gray;
  }
};

// Shared Helper: Draw Section Title Box
export const drawSectionHeader = (doc, title, y) => {
  doc.setFillColor(...C.bluePrimary);
  doc.rect(14, y, 182, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.white);
  doc.text(title, 18, y + 5.5);
  return y + 14;
};

// Shared Helper: Render standard autoTables
export const renderTable = (doc, opts) => {
  autoTable(doc, {
    styles: {
      fontSize: 8,
      cellPadding: { top: 3.5, right: 4, bottom: 3.5, left: 4 },
      fillColor: C.bg,
      textColor: C.textMain,
      lineColor: C.lineColor,
      lineWidth: 0.15,
      font: "helvetica",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: C.bgHeader,
      textColor: C.white,
      fontStyle: "bold",
      fontSize: 8,
      lineColor: C.bluePrimary,
      lineWidth: 0.15,
    },
    alternateRowStyles: { fillColor: C.bgAlt },
    margin: { left: 14, right: 14 },
    ...opts,
  });
};

// Shared Helper: Get auditor profile details
export const getAuditorInfo = () => {
  let employeeName = "Security Auditor";
  let employeeMail = "auditor@nexcorealliance.com";
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.name) employeeName = parsed.name;
      if (parsed.email) employeeMail = parsed.email;
    }
  } catch (_) {}
  return { employeeName, employeeMail };
};

// Shared Helper: Post-processing Header/Footer Decorator
export const applyHeaderFooterDecorator = (doc, toolTitle) => {
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageW = doc.internal.pageSize.getWidth();

    // 1. Draw top blue banner stripe on every page
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, pageW, 3, "F");

    // 2. Draw running header text on subsequent pages (page > 1)
    if (i > 1) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.textMuted);
      doc.text(`NEXCORE ALLIANCE | Individual Tool Report – ${toolTitle}`, 14, 12);
      
      doc.setDrawColor(...C.bluePrimary);
      doc.setLineWidth(0.2);
      doc.line(14, 14.5, 196, 14.5);
    }

    // 3. Draw running footer on every page
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    
    doc.setDrawColor(...C.lineColor);
    doc.setLineWidth(0.2);
    doc.line(14, 283, 196, 283);

    doc.text("Confidential | www.nexcorealliance.com", 14, 289);
    doc.text(`Page ${i} of ${totalPages}`, pageW - 14, 289, { align: "right" });
  }
};
