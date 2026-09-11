import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate } from './formatters';

/**
 * Generate full Mandal Financial Audit Statement PDF
 */
export function generateMandalStatementPDF({ mandalInfo, varganiList, expenseList, stats }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryMaroon = [139, 38, 22]; // Heritage Maroon #8B2616
  const saffronColor = [232, 115, 74]; // Saffron #E8734A
  const darkColor = [36, 25, 19];
  const greenColor = [45, 106, 79]; // Indrayani Teal #2D6A4F
  const redColor = [185, 28, 28];

  // Header Banner
  doc.setFillColor(...primaryMaroon);
  doc.rect(0, 0, 210, 36, 'F');

  // Mandal Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(mandalInfo?.englishName || 'Indrayani Vihar Mitra Mandal', 105, 14, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(
    `${mandalInfo?.location || 'Indrayani Vihar, Lohegaon, Pune'} | Ganesh Utsav ${mandalInfo?.year || 2026}`,
    105,
    22,
    { align: 'center' }
  );
  doc.text(`Official Financial Audit & Vargani Statement | Generated on ${formatDate(new Date().toISOString())}`, 105, 28, { align: 'center' });

  // Summary Metrics Box
  doc.setFillColor(255, 248, 246);
  doc.setDrawColor(240, 223, 213);
  doc.roundedRect(14, 42, 182, 28, 3, 3, 'FD');

  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);

  // Column 1: Total Received
  doc.text('Total Vargani Collected', 22, 50);
  doc.setTextColor(...greenColor);
  doc.setFontSize(13);
  doc.text(formatCurrency(stats.totalReceived || 0), 22, 58);
  doc.setFontSize(8);
  doc.setTextColor(107, 94, 87);
  doc.text(`Verified Donors: ${stats.verifiedCount || 0}`, 22, 64);

  // Column 2: Total Expenses
  doc.setTextColor(...darkColor);
  doc.setFontSize(10);
  doc.text('Total Expenses Paid', 85, 50);
  doc.setTextColor(...redColor);
  doc.setFontSize(13);
  doc.text(formatCurrency(stats.totalExpenses || 0), 85, 58);
  doc.setFontSize(8);
  doc.setTextColor(107, 94, 87);
  doc.text(`Bills/Vouchers: ${expenseList.length}`, 85, 64);

  // Column 3: Net Cash Balance
  doc.setTextColor(...darkColor);
  doc.setFontSize(10);
  doc.text('Treasury Net Balance', 148, 50);
  doc.setTextColor(...primaryMaroon);
  doc.setFontSize(13);
  doc.text(formatCurrency(stats.netBalance || 0), 148, 58);
  doc.setFontSize(8);
  doc.setTextColor(107, 94, 87);
  doc.text(`Pending Verification: ${formatCurrency(stats.totalPending || 0)}`, 148, 64);

  // Section 1: Vargani / Contributions Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryMaroon);
  doc.text('1. Vargani (Donations) Summary', 14, 78);

  const varganiRows = varganiList.map((item, idx) => [
    idx + 1,
    item.receiptNo || `#IV-2026-${String(idx + 1).padStart(3, '0')}`,
    item.donorName || 'Devotee',
    item.wingFlat || item.address || '-',
    item.phone || '-',
    item.mode || 'UPI',
    item.status === 'verified' ? 'Verified' : 'Pending',
    formatCurrency(item.amount)
  ]);

  doc.autoTable({
    startY: 82,
    head: [['#', 'Receipt No', 'Donor Name', 'Flat / Wing', 'Mobile', 'Mode', 'Status', 'Amount']],
    body: varganiRows,
    theme: 'grid',
    headStyles: {
      fillColor: primaryMaroon,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkColor
    },
    alternateRowStyles: {
      fillColor: [255, 248, 246]
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 26 },
      2: { cellWidth: 38 },
      3: { cellWidth: 24 },
      4: { cellWidth: 24 },
      5: { cellWidth: 16 },
      6: { cellWidth: 18 },
      7: { cellWidth: 28, halign: 'right', fontStyle: 'bold' }
    }
  });

  // Section 2: Expense Breakdown Table
  let finalY = doc.lastAutoTable.finalY + 12;
  if (finalY > 240) {
    doc.addPage();
    finalY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryMaroon);
  doc.text('2. Expense Breakdown & Vendor Payouts', 14, finalY);

  const expenseRows = expenseList.map((item, idx) => [
    idx + 1,
    formatDate(item.date),
    item.category || 'General',
    item.title || item.description || '-',
    item.vendor || '-',
    item.paidBy || 'Mandal',
    formatCurrency(item.amount)
  ]);

  doc.autoTable({
    startY: finalY + 4,
    head: [['#', 'Date', 'Category', 'Description', 'Vendor', 'Paid By', 'Amount']],
    body: expenseRows,
    theme: 'grid',
    headStyles: {
      fillColor: [55, 30, 24],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkColor
    },
    alternateRowStyles: {
      fillColor: [255, 248, 246]
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 22 },
      2: { cellWidth: 26 },
      3: { cellWidth: 46 },
      4: { cellWidth: 30 },
      5: { cellWidth: 26 },
      6: { cellWidth: 24, halign: 'right', fontStyle: 'bold', textColor: redColor }
    }
  });

  // Footer / Signatures
  let signY = doc.lastAutoTable.finalY + 20;
  if (signY > 265) {
    doc.addPage();
    signY = 30;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(107, 94, 87);
  doc.text('Generated via Indrayani Vihar Mitra Mandal PWA', 14, signY);
  doc.text('President (Sachin Joshi): _______________', 85, signY);
  doc.text('Treasurer (Vijay Pawar): _______________', 148, signY);

  const filename = `Indrayani_Vihar_Mitra_Mandal_Statement_${mandalInfo?.year || 2026}.pdf`;
  doc.save(filename);
}

/**
 * Generate Single Printable Donor Vargani Receipt (A5 / Slip style)
 */
export function generateSingleReceiptPDF({ mandalInfo, varganiItem }) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a5'
  });

  const primaryMaroon = [139, 38, 22]; // #8B2616
  const darkColor = [36, 25, 19];
  const greenColor = [45, 106, 79];

  // Outer Border
  doc.setDrawColor(...primaryMaroon);
  doc.setLineWidth(1);
  doc.roundedRect(8, 8, 194, 132, 4, 4, 'D');

  // Header Banner
  doc.setFillColor(...primaryMaroon);
  doc.roundedRect(10, 10, 190, 26, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(mandalInfo?.englishName || 'Indrayani Vihar Mitra Mandal', 105, 19, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${mandalInfo?.location || 'Indrayani Vihar, Lohegaon, Pune'} | Ganesh Utsav ${mandalInfo?.year || 2026}`, 105, 26, { align: 'center' });
  doc.text('OFFICIAL DONATION / VARGANI RECEIPT', 105, 32, { align: 'center' });

  // Receipt Number and Date
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Receipt No: ${varganiItem.receiptNo || '#IV-2026-001'}`, 16, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${formatDate(varganiItem.createdAt || new Date().toISOString())}`, 145, 45);

  // Line separator
  doc.setDrawColor(240, 223, 213);
  doc.line(16, 48, 194, 48);

  // Donor Details Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Received with thanks from:', 16, 56);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...primaryMaroon);
  doc.text(`Shri/Smt. ${varganiItem.donorName || 'Devotee'}`, 16, 64);

  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (varganiItem.wingFlat || varganiItem.address) {
    doc.text(`Flat / Wing: ${varganiItem.wingFlat || varganiItem.address}`, 16, 72);
  }
  if (varganiItem.phone) {
    doc.text(`Mobile: ${varganiItem.phone}`, 120, 72);
  }

  // Amount Highlight Box
  doc.setFillColor(255, 248, 246);
  doc.setDrawColor(232, 115, 74);
  doc.roundedRect(16, 80, 178, 22, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...darkColor);
  doc.text('Amount Received:', 22, 90);

  doc.setFontSize(16);
  doc.setTextColor(...greenColor);
  doc.text(formatCurrency(varganiItem.amount), 65, 90);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 94, 87);
  doc.text(`Mode: ${varganiItem.mode || 'UPI'} | Status: ${varganiItem.status === 'verified' ? 'Verified' : 'Pending'} ${varganiItem.utr ? `| UTR: ${varganiItem.utr}` : ''}`, 22, 97);

  // Collector & Footer
  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.text(`Collected by: ${varganiItem.collectedBy || 'Organiser'}`, 16, 118);
  doc.text('Authorized Signatory: _________________', 125, 118);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Thank you for your generous contribution. गणपती बाप्पा मोरया! मंगलमूर्ती मोरया!', 105, 132, { align: 'center' });

  const filename = `Receipt_${(varganiItem.receiptNo || 'Vargani').replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
  doc.save(filename);
}
