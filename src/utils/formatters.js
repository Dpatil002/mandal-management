/**
 * Format numbers into Indian Rupee (INR) currency format with Indian comma grouping (e.g. ₹1,85,400)
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  return '₹' + num.toLocaleString('en-IN');
}

/**
 * Format date to readable Indian format (e.g. 08 Sep 2026 or Today)
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return 'Today (आज)';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format time to 12-hour format (e.g. 10:00 AM)
 */
export function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Sequential receipt number generator (e.g. #IV-2026-089)
 */
export function generateReceiptNumber(count, year = 2026) {
  const sequence = String(count).padStart(3, '0');
  return `#IV-${year}-${sequence}`;
}

/**
 * Generate UPI deep links for Google Pay, PhonePe, and BHIM/Standard UPI
 */
export function getUpiDeepLinks({ vpa = 'mandal@upi', name = 'Indrayani Vihar Mitra Mandal', amount = '', note = 'Ganesh Utsav Vargani' }) {
  const encName = encodeURIComponent(name);
  const encNote = encodeURIComponent(note);
  const amtParam = amount && Number(amount) > 0 ? `&am=${Number(amount).toFixed(2)}` : '';

  const standardUpi = `upi://pay?pa=${vpa}&pn=${encName}${amtParam}&cu=INR&tn=${encNote}`;
  const gpayUrl = `gpay://upi/pay?pa=${vpa}&pn=${encName}${amtParam}&cu=INR&tn=${encNote}`;
  const phonepeUrl = `phonepe://pay?pa=${vpa}&pn=${encName}${amtParam}&cu=INR&tn=${encNote}`;
  const paytmUrl = `paytmmp://pay?pa=${vpa}&pn=${encName}${amtParam}&cu=INR&tn=${encNote}`;

  return {
    standard: standardUpi,
    gpay: gpayUrl,
    phonepe: phonepeUrl,
    paytm: paytmUrl
  };
}

/**
 * WhatsApp receipt sharing link
 */
export function buildWhatsAppShareUrl(phone, message) {
  let cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }
  const encodedText = encodeURIComponent(message);
  return cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
}
