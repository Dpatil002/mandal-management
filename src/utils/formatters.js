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
 * Detect client platform (Android, iOS, or Desktop)
 */
export function getMobilePlatform() {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent || navigator.vendor || (typeof window !== 'undefined' && window.opera) || '';
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua) && (typeof window === 'undefined' || !window.MSStream)) return 'ios';
  return 'desktop';
}

/**
 * Generate UPI deep links for Google Pay, PhonePe, Paytm, and BHIM/Standard UPI
 */
export function getUpiDeepLinks({ vpa = '9673909460@ybl', name = 'Indrayani Vihar Mitra Mandal', amount = '', note = 'Ganesh Utsav Vargani' }) {
  const cleanVpa = (vpa || '9673909460@ybl').trim();
  const encName = encodeURIComponent(name || 'Indrayani Vihar Mitra Mandal');
  const encNote = encodeURIComponent(note || 'Ganesh Utsav 2026 Vargani');
  const amtParam = amount && Number(amount) > 0 ? `&am=${Number(amount).toFixed(2)}` : '';

  // Universal NPCI standard format (works across all UPI apps on Android and iOS)
  const standardUpi = `upi://pay?pa=${cleanVpa}&pn=${encName}${amtParam}&cu=INR&tn=${encNote}`;
  
  // Android explicit App Intent URLs targeting exact package handlers
  const gpayAndroidIntent = `intent://pay?pa=${cleanVpa}&pn=${encName}${amtParam}&cu=INR&tn=${encNote}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
  const phonepeAndroidIntent = `phonepe://pay?pa=${cleanVpa}&pn=${encName}${amtParam}&cu=INR&tn=${encNote}`;
  const paytmAndroidIntent = `paytmmp://pay?pa=${cleanVpa}&pn=${encName}${amtParam}&cu=INR&tn=${encNote}`;

  // iOS Custom URL schemes (Google Pay in India uses tez:// on iOS)
  const gpayIosUrl = `tez://upi/pay?pa=${cleanVpa}&pn=${encName}${amtParam}&cu=INR&tn=${encNote}`;
  const phonepeIosUrl = `phonepe://pay?pa=${cleanVpa}&pn=${encName}${amtParam}&cu=INR&tn=${encNote}`;
  const paytmIosUrl = `paytmmp://pay?pa=${cleanVpa}&pn=${encName}${amtParam}&cu=INR&tn=${encNote}`;

  const platform = getMobilePlatform();

  let gpayUrl = standardUpi;
  let phonepeUrl = standardUpi;
  let paytmUrl = standardUpi;

  if (platform === 'android') {
    gpayUrl = gpayAndroidIntent;
    phonepeUrl = phonepeAndroidIntent;
    paytmUrl = paytmAndroidIntent;
  } else if (platform === 'ios') {
    gpayUrl = gpayIosUrl;
    phonepeUrl = phonepeIosUrl;
    paytmUrl = paytmIosUrl;
  } else {
    gpayUrl = standardUpi;
    phonepeUrl = phonepeAndroidIntent;
    paytmUrl = paytmAndroidIntent;
  }

  return {
    standard: standardUpi,
    gpay: gpayUrl,
    gpayAndroid: gpayAndroidIntent,
    gpayIos: gpayIosUrl,
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
