import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { C, drawSectionHeader, safe, applyHeaderFooterDecorator } from "@/utils/pdfFramework";

/**
 * Generate a Payment Receipt PDF for a subscription upgrade
 * @param {Object} receiptData - The receipt data from the backend
 */
export const generatePaymentReceiptPDF = (receiptData) => {
  if (!receiptData) return;

  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();

  // --- Title & Metadata ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...C.bluePrimary);
  doc.text("PAYMENT RECEIPT", 14, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.textMuted);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  
  // Right-aligned header info
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.textMain);
  doc.text("Nexcore Security Platform", pageW - 14, 22, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.textMuted);
  doc.text("support@nexcorealliance.com", pageW - 14, 27, { align: "right" });

  let yPos = 35;

  // --- Receipt Summary Table ---
  yPos = drawSectionHeader(doc, "Transaction Details", yPos);

  const receiptTableData = [
    ["Receipt ID", safe(receiptData.receiptId)],
    ["Transaction Date", safe(receiptData.paidAt ? new Date(receiptData.paidAt).toLocaleString() : null)],
    ["Razorpay Order ID", safe(receiptData.razorpayOrderId)],
    ["Razorpay Payment ID", safe(receiptData.razorpayPaymentId)],
    ["Status", "PAID"],
  ];

  autoTable(doc, {
    startY: yPos,
    body: receiptTableData,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 4,
      fillColor: C.bg,
      textColor: C.textMain,
      lineColor: C.lineColor,
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: C.bgAlt, cellWidth: 60 },
      1: { cellWidth: 122 },
    },
    margin: { left: 14, right: 14 },
  });

  yPos = doc.lastAutoTable.finalY + 12;

  // --- Customer & Plan Details ---
  yPos = drawSectionHeader(doc, "Subscription & Customer Details", yPos);

  const customerTableData = [
    ["Customer Name", safe(receiptData.userName)],
    ["Customer Email", safe(receiptData.userEmail)],
    ["Customer ID", safe(receiptData.userId)],
    ["Plan Selected", safe(receiptData.plan)],
    ["Credits Allocated", safe(receiptData.creditsGranted)],
    ["Subscription Start", safe(receiptData.startDate ? new Date(receiptData.startDate).toLocaleDateString() : null)],
    ["Subscription End", safe(receiptData.endDate ? new Date(receiptData.endDate).toLocaleDateString() : null)],
    ["Amount Paid", `Rs. ${safe(receiptData.amount)}`],
  ];

  autoTable(doc, {
    startY: yPos,
    body: customerTableData,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 4,
      fillColor: C.bg,
      textColor: C.textMain,
      lineColor: C.lineColor,
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: C.bgAlt, cellWidth: 60 },
      1: { cellWidth: 122 },
    },
    margin: { left: 14, right: 14 },
  });

  yPos = doc.lastAutoTable.finalY + 20;

  // --- Footer / Thank you note ---
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(...C.textMain);
  doc.text("Thank you for choosing Nexcore Security Platform.", 14, yPos);
  
  yPos += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.textMuted);
  doc.text("If you have any questions about this receipt, please contact our support team.", 14, yPos);

  // Apply standard headers and footers
  applyHeaderFooterDecorator(doc, "Payment Receipt");

  // Save the PDF
  const filename = `Nexcore_Receipt_${safe(receiptData.receiptId, "Invoice")}.pdf`;
  doc.save(filename);
};
