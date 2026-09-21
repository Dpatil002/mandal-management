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
export function exportVarganiToCSV(varganiList, mandalName = 'Indrayani_Vihar_Mitra_Mandal', language = 'en') {
  const isMarathi = language === 'mr';
  const headers = isMarathi
    ? ['पावती क्र. (Receipt No)', 'देणगीदाराचे नाव (Donor Name)', 'वर्गणी स्वीकारली (Paid To)', 'मोबाईल (Mobile)', 'रक्कम (Amount INR)', 'पेमेंट पद्धत (Payment Mode)', 'स्थिती (Status)', 'UTR / संदर्भ क्र. (UTR No)', 'दिनांक (Date)', 'नोंदणीकर्ता (Recorded By)']
    : ['Receipt No', 'Donor Name', 'Paid To / Collected By', 'Mobile', 'Amount (INR)', 'Payment Mode', 'Status', 'UTR Number', 'Date', 'Recorded By'];
  
  const rows = varganiList.map(item => [
    sanitizeCSVCell(item.receiptNo),
    sanitizeCSVCell(item.donorName),
    sanitizeCSVCell(item.collectedBy || item.paidTo || '-'),
    sanitizeCSVCell(item.phone),
    item.amount || 0,
    sanitizeCSVCell(item.mode),
    sanitizeCSVCell(item.status === 'verified' ? (isMarathi ? 'स्वीकृत (Verified)' : 'Verified') : (isMarathi ? 'प्रलंबित (Pending)' : 'Pending')),
    sanitizeCSVCell(item.utr || ''),
    sanitizeCSVCell(item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : ''),
    sanitizeCSVCell(item.lastEditedBy || item.collectedBy || '')
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const filename = `${mandalName.replace(/\s+/g, '_')}_Vargani_${isMarathi ? 'Marathi_' : 'English_'}${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export Expenses to CSV
 */
export function exportExpensesToCSV(expenseList, mandalName = 'Indrayani_Vihar_Mitra_Mandal', language = 'en') {
  const isMarathi = language === 'mr';
  const headers = isMarathi
    ? ['दिनांक (Date)', 'वर्गवारी (Category)', 'खर्च वर्णन / तपशील (Description)', 'रक्कम (Amount INR)', 'दुकान / विक्रेता (Vendor)', 'खर्चकर्ता (Paid By)', 'टीप (Notes)']
    : ['Date', 'Category', 'Description/Item', 'Amount (INR)', 'Vendor', 'Paid By', 'Notes'];

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
  const filename = `${mandalName.replace(/\s+/g, '_')}_Expenses_${isMarathi ? 'Marathi_' : 'English_'}${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export Dhol Tasha Maintenance Log to CSV
 */
export function exportDholMaintenanceToCSV(maintenanceList, mandalName = 'Indrayani_Vihar_Mitra_Mandal', language = 'en') {
  const isMarathi = language === 'mr';
  const headers = isMarathi
    ? ['दिनांक (Date)', 'वाद्य / दुरुस्ती प्रकार (Instrument/Service)', 'रक्कम (Amount INR)', 'दुरुस्ती कारागीर / विक्रेता (Serviced By)', 'टीप (Notes)']
    : ['Date', 'Instrument / Service', 'Amount (INR)', 'Serviced By / Vendor', 'Notes'];

  const rows = maintenanceList.map(item => [
    sanitizeCSVCell(item.date ? new Date(item.date).toLocaleDateString('en-IN') : ''),
    sanitizeCSVCell(item.instrumentType),
    item.amount || 0,
    sanitizeCSVCell(item.servicedBy),
    sanitizeCSVCell(item.notes || '')
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const filename = `${mandalName.replace(/\s+/g, '_')}_Dhol_Maintenance_${isMarathi ? 'Marathi_' : 'English_'}${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCSV(csvContent, filename);
}
