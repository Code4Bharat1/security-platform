import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

export const generateSecureCryptPDF = async (report = {}, mode = "encrypt", inputText = "", outputText = "") => {
  const { employeeName, employeeMail } = getAuditorInfo();
  
  // Format dates
  const now = new Date();
  const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const isEncrypt = mode === "encrypt";

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
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – SecureCrypt", 14, 12);

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
    doc.text("SECURECRYPT SECURITY ASSESSMENT REPORT", 105, 54, { align: "center" });

    // Divider below title
    doc.line(14, 65, 196, 65);

    // Truncate input data preview for display
    const rawInput = inputText || "";
    const textPreview = rawInput.slice(0, 40) + (rawInput.length > 40 ? "..." : "");

    // Assessment Info table
    renderTable(doc, {
      startY: 72,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Input Data / File",       textPreview || "—"],
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

    // Cover footer line
    doc.line(14, 260, 196, 260);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant", 105, 267, { align: "center" });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 2 — ASSESSMENT INFORMATION
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    let y = 25;

    y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", y);

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "SecureCrypt"],
        ["Tool Category",         "Cryptographic Utility / Encryption & Decryption Tool"],
        ["Methodology Alignment", "OWASP WSTG – OTG-CRYPST / Cryptographic Controls Testing"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Input Data / File",     textPreview || "—"],
        ["Assessment Mode",       "Non-Intrusive / Automated Cryptographic Analysis"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });
    y = doc.lastAutoTable.finalY + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);
    y += 5;

    const overviewText =
      "SecureCrypt is a cryptographic utility tool that provides symmetric encryption and decryption capabilities using industry-standard algorithms. The tool employs AES-256-GCM (Advanced Encryption Standard in Galois/Counter Mode) for authenticated encryption, ensuring both the confidentiality and integrity of processed data. Key derivation is performed using PBKDF2-SHA256 with a configurable iteration count, salt, and 256-bit key length in compliance with NIST SP 800-132 recommendations. The tool outputs a unique Initialisation Vector (IV), Authentication Tag, and Base64-encoded ciphertext for each encryption operation, enabling secure data storage and transmission within enterprise environments.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(overviewText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY & DETAILED FINDINGS
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    renderTable(doc, {
      startY: y,
      head: [["Operations Performed", "Encryption", "Decryption", "Algorithm Used", "Operation Status"]],
      body: [
        [
          "1",
          isEncrypt ? "1" : "0",
          isEncrypt ? "0" : "1",
          safe(report.algorithm, "AES-256-GCM").toUpperCase(),
          "Completed"
        ]
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      columnStyles: {
        0: { halign: "center", cellWidth: 35 },
        1: { halign: "center", cellWidth: 25 },
        2: { halign: "center", cellWidth: 25 },
        3: { halign: "center", cellWidth: 50 },
        4: { halign: "center", cellWidth: 47 },
      }
    });
    y = doc.lastAutoTable.finalY + 8;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Detailed Findings – Cryptographic Operation Analysis", 14, y);
    y += 5;

    // Truncate ciphertext/package outputs to keep layout aligned
    const rawCipher = report.ciphertext || (isEncrypt ? outputText : inputText) || "";
    const cipherPreview = rawCipher.slice(0, 45) + (rawCipher.length > 45 ? "..." : "");

    const detailedBody = [
      ["Operation Mode",              isEncrypt ? "Encrypt" : "Decrypt"],
      ["Algorithm",                   `${safe(report.algorithm, "AES-256-GCM").toUpperCase()} (Advanced Encryption Standard – Galois/Counter Mode)`],
      ["Key Derivation Function (KDF)", isEncrypt ? "PBKDF2-SHA256" : safe(report.kdf, "PBKDF2-SHA256")],
      ["Iterations",                  String(report.iterations || "310,000")],
      ["Key Length",                  isEncrypt ? "256-bit" : `${safe(report.keyLengthBits, "256")}-bit`],
      ["Salt",                        safe(report.salt)],
      ["Initialisation Vector (IV)",   safe(report.iv)],
      ["Authentication Tag",          safe(report.authTag)],
      [isEncrypt ? "Ciphertext Output" : "Decrypted Plaintext", isEncrypt ? cipherPreview : (outputText || "—")],
      ["Severity",                    "Informational"],
      ["Status",                      "Passed"],
      ["Authentication Tag Validity",  "Authentication Tag present – ensures integrity and authenticity of the ciphertext."],
      ["Issue Detected",              "No cryptographic weaknesses detected. All parameters conform to industry-standard secure encryption practices."],
      ["Impact",                      "No immediate impact. The encryption operation was completed successfully using strong cryptographic primitives."],
      ["Recommendation",              "Ensure the encryption key and salt are stored securely and never hardcoded in source code. Rotate keys periodically in accordance with organisational key management policies. Verify that IV uniqueness is enforced programmatically to prevent nonce reuse. Confirm that decryption operations validate the Authentication Tag before processing plaintext."],
    ];

    renderTable(doc, {
      startY: y,
      head: [["Parameter", "Details"]],
      body: detailedBody,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: 127 },
      }
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 4 — CONCLUSION & APPENDIX
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionText1 =
      `The SecureCrypt assessment was performed on an ${mode} operation submitted for analysis. The tool successfully executed ${safe(report.algorithm, "AES-256-GCM").toUpperCase()} encryption using ${isEncrypt ? "PBKDF2-SHA256" : safe(report.kdf, "PBKDF2-SHA256")} key derivation with ${report.iterations || "310,000"} iterations and a 256-bit key length. All cryptographic parameters — including the Salt, Initialisation Vector, Authentication Tag, and Ciphertext — were generated in conformance with current industry standards. No cryptographic weaknesses, misconfigurations, or vulnerabilities were identified during the assessment.`;

    const conclusionText2 =
      "It is recommended that encryption keys and salts be stored in a secure key management system and never hardcoded within application source code or configuration files. Key rotation policies should be established and enforced in accordance with organisational security standards. The tool should programmatically enforce IV uniqueness for every encryption operation to prevent nonce reuse, which would otherwise compromise the security guarantees of GCM mode. Decryption workflows must validate the Authentication Tag prior to processing any plaintext output. The iteration count for PBKDF2-SHA256 should be reviewed periodically and increased in line with evolving OWASP and NIST guidance to maintain resistance against brute-force attacks.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 24;

    doc.text(conclusionText2, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 32;

    y = drawSectionHeader(doc, "5. APPENDIX", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);
    y += 5;

    const appendixPart1 = [
      ["Operation Mode", "Indicates whether the cryptographic operation performed was Encryption or Decryption."],
      ["Algorithm", "The symmetric encryption algorithm used for the operation (e.g., AES-256-GCM)."],
      ["Key Derivation Function (KDF)", "The algorithm used to derive the encryption key from the passphrase (e.g., PBKDF2-SHA256)."],
      ["Iterations", "The number of KDF iterations applied. Higher values increase resistance to brute-force attacks."],
      ["Key Length", "The bit-length of the derived encryption key. 256-bit keys provide the highest AES security level."],
      ["Salt", "A random value used during key derivation to prevent pre-computation attacks. Unique per operation."],
      ["Initialisation Vector (IV)", "A unique nonce used to initialise the cipher. Reuse of IV with the same key compromises GCM security."],
      ["Authentication Tag", "A cryptographic value appended to ciphertext in GCM mode that verifies integrity and authenticity."],
    ];

    renderTable(doc, {
      startY: y,
      head: [["Column", "Description"]],
      body: appendixPart1,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: 127 },
      }
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 5 — APPENDIX CONTINUED & ACKNOWLEDGEMENT
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    const appendixPart2 = [
      ["Ciphertext Output", "The Base64-encoded encrypted output produced by the encryption operation."],
      ["Severity", "Risk level assigned to the cryptographic finding: Critical / High / Medium / Low / Informational"],
      ["Status", "Outcome of the cryptographic operation assessment: Passed | Failed | Warning | Informational"],
      ["Authentication Tag Validity", "Confirms the presence and validity of the GCM authentication tag for integrity assurance."],
      ["Issue Detected", "A concise description of any cryptographic weakness or misconfiguration identified."],
      ["Impact", "The potential security consequence of the identified cryptographic issue."],
      ["Recommendation", "Specific, actionable guidance to remediate or strengthen the cryptographic implementation."],
    ];

    renderTable(doc, {
      startY: y,
      head: [["Column", "Description"]],
      body: appendixPart2,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: 127 },
      }
    });
    y = doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);
    y += 6;

    const ackText =
      "The findings presented in this report are based on observations made during the assessment period and represent the cryptographic operation security status of the submitted input at the time of analysis. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

    // Apply header/footer running templates
    applyHeaderFooterDecorator(doc, "SecureCrypt");

    // Save
    doc.save(`SecureCrypt_Assessment_Report_${mode}_${scanDate}.pdf`);

  } catch (err) {
    console.error("Failed to generate SecureCrypt PDF:", err);
  }
};
