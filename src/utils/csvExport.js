/**
 * Export data array to CSV file and trigger download
 */
function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Clean cell content for CSV (escape double quotes)
 */
function sanitizeCSVCell(str) {
  if (str === null || str === undefined) return '""';
  const val = String(str).replace(/"/g, '""');
  return `"${val}"`;
}

/**
 * Export Vargani / Donations to CSV (compatible with Google Sheets & Excel)
 */
export function exportVarganiToCSV(varganiList, mandalName = 'Indrayani_Vihar_Mitra_Mandal') {
  const headers = ['Receipt No', 'Donor Name', 'Flat/Wing', 'Mobile', 'Amount (INR)', 'Payment Mode', 'Status', 'UTR Number', 'Date', 'Collected By'];
  
  const rows = varganiList.map(item => [
    sanitizeCSVCell(item.receiptNo),
    sanitizeCSVCell(item.donorName),
    sanitizeCSVCell(item.wingFlat || item.address),
    sanitizeCSVCell(item.phone),
    item.amount || 0,
    sanitizeCSVCell(item.mode),
    sanitizeCSVCell(item.status === 'verified' ? 'Verified' : 'Pending'),
    sanitizeCSVCell(item.utr || ''),
    sanitizeCSVCell(item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : ''),
    sanitizeCSVCell(item.collectedBy)
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const filename = `${mandalName.replace(/\s+/g, '_')}_Vargani_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export Expenses to CSV
 */
export function exportExpensesToCSV(expenseList, mandalName = 'Indrayani_Vihar_Mitra_Mandal') {
  const headers = ['Date', 'Category', 'Description/Item', 'Amount (INR)', 'Vendor', 'Paid By', 'Notes'];

  const rows = expenseList.map(item => [
    sanitizeCSVCell(item.date ? new Date(item.date).toLocaleDateString('en-IN') : ''),
    sanitizeCSVCell(item.category),
    sanitizeCSVCell(item.title || item.description),
    item.amount || 0,
    sanitizeCSVCell(item.vendor),
    sanitizeCSVCell(item.paidBy),
    sanitizeCSVCell(item.notes || '')
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const filename = `${mandalName.replace(/\s+/g, '_')}_Expenses_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export Dhol Tasha Maintenance Log to CSV
 */
export function exportDholMaintenanceToCSV(maintenanceList, mandalName = 'Indrayani_Vihar_Mitra_Mandal') {
  const headers = ['Date', 'Instrument / Service', 'Amount (INR)', 'Serviced By / Vendor', 'Notes'];

  const rows = maintenanceList.map(item => [
    sanitizeCSVCell(item.date ? new Date(item.date).toLocaleDateString('en-IN') : ''),
    sanitizeCSVCell(item.instrumentType),
    item.amount || 0,
    sanitizeCSVCell(item.servicedBy),
    sanitizeCSVCell(item.notes || '')
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const filename = `${mandalName.replace(/\s+/g, '_')}_Dhol_Maintenance_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCSV(csvContent, filename);
}
