/**
 * Centralized Input Validation and Sanitization Module
 * Enforces strict typing, length limits, pattern matching, and file validation.
 */

// UPI ID format: username@bankhandle (e.g., 9673909460@ybl, mandal@sbi)
export const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z0-9]{2,32}$/;

// Indian Mobile Number: 10 digits starting with 6, 7, 8, 9
export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

// Standard 4-digit numeric PIN
export const PIN_REGEX = /^\d{4}$/;

// IFSC Code format: 4 alphabets, 0, 6 alphanumeric (e.g. SBIN0012345)
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// Bank Account Number: 9 to 18 numeric digits
export const BANK_ACCOUNT_REGEX = /^\d{9,18}$/;

// Google Drive URL format
export const GOOGLE_DRIVE_URL_REGEX = /^https:\/\/(drive|docs)\.google\.com\/(drive\/folders\/|file\/d\/|open\?id=)[a-zA-Z0-9_\-]+(\?.*)?$/;

/**
 * Strips dangerous HTML, javascript:, and control characters from text to prevent Stored XSS
 * @param {string} input 
 * @returns {string} Cleaned sanitized text
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Strip angle brackets
    .replace(/javascript:/gi, '') // Strip inline javascript pseudoprotocols
    .replace(/data:/gi, '') // Strip data URIs in text fields
    .trim();
}

/**
 * Validates donor/organizer names
 * @param {string} name 
 * @param {number} minLen 
 * @param {number} maxLen 
 * @returns {{ isValid: boolean, error: string|null, sanitized: string }}
 */
export function validateName(name, minLen = 2, maxLen = 100) {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'कृपया नाव प्रविष्ट करा (Please enter a name).', sanitized: '' };
  }
  const clean = sanitizeText(name);
  if (clean.length < minLen) {
    return { isValid: false, error: `नाव किमान ${minLen} अक्षरांचे असावे (Name must be at least ${minLen} characters).`, sanitized: clean };
  }
  if (clean.length > maxLen) {
    return { isValid: false, error: `नाव कमाल ${maxLen} अक्षरांपेक्षा जास्त नसावे (Name cannot exceed ${maxLen} characters).`, sanitized: clean };
  }
  return { isValid: true, error: null, sanitized: clean };
}

/**
 * Validates 10-digit Indian Mobile/WhatsApp Number
 * @param {string} phone 
 * @returns {{ isValid: boolean, error: string|null, cleanPhone: string }}
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'कृपया १०-अंकी मोबाईल नंबर प्रविष्ट करा (Please enter a 10-digit mobile number).', cleanPhone: '' };
  }
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (!INDIAN_PHONE_REGEX.test(digits)) {
    return {
      isValid: false,
      error: 'अवैध मोबाईल नंबर! कृपया ६, ७, ८ किंवा ९ ने सुरू होणारा १०-अंकी नंबर टाका (Please enter a valid 10-digit phone number starting with 6-9).',
      cleanPhone: digits
    };
  }
  return { isValid: true, error: null, cleanPhone: digits };
}

/**
 * Validates financial transaction amounts
 * @param {number|string} amount 
 * @param {number} min 
 * @param {number} max 
 * @returns {{ isValid: boolean, error: string|null, value: number }}
 */
export function validateAmount(amount, min = 1, max = 1000000) {
  const num = typeof amount === 'number' ? amount : Number(String(amount).replace(/,/g, '').trim());
  if (isNaN(num) || !isFinite(num)) {
    return { isValid: false, error: 'कृपया वैध रक्कम प्रविष्ट करा (Please enter a valid numeric amount).', value: 0 };
  }
  if (!Number.isInteger(num) && num < 1) {
    return { isValid: false, error: 'रक्कम १ पेक्षा जास्त असावी (Amount must be at least ₹1).', value: 0 };
  }
  if (num < min) {
    return { isValid: false, error: `रक्कम किमान ₹${min.toLocaleString('en-IN')} असावी (Minimum amount is ₹${min}).`, value: num };
  }
  if (num > max) {
    return { isValid: false, error: `रक्कम कमाल ₹${max.toLocaleString('en-IN')} पेक्षा जास्त असू शकत नाही (Amount cannot exceed ₹${max.toLocaleString('en-IN')}).`, value: num };
  }
  return { isValid: true, error: null, value: Math.floor(num) };
}

/**
 * Validates UPI VPA string (e.g. 9673909460@ybl)
 * @param {string} upiId 
 * @returns {{ isValid: boolean, error: string|null, sanitized: string }}
 */
export function validateUpiId(upiId) {
  if (!upiId || typeof upiId !== 'string') {
    return { isValid: false, error: 'कृपया UPI ID प्रविष्ट करा (Please enter UPI ID).', sanitized: '' };
  }
  const clean = upiId.trim().toLowerCase();
  if (!UPI_ID_REGEX.test(clean)) {
    return {
      isValid: false,
      error: 'अवैध UPI ID स्वरूप! कृपया name@bank स्वरूपात टाका (e.g. 9673909460@ybl, mandal@sbi).',
      sanitized: clean
    };
  }
  return { isValid: true, error: null, sanitized: clean };
}

/**
 * Validates Google Drive folder/file URL
 * @param {string} url 
 * @returns {{ isValid: boolean, error: string|null, sanitized: string }}
 */
export function validateGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return { isValid: true, error: null, sanitized: '' }; // Optional
  const clean = url.trim();
  if (!clean) return { isValid: true, error: null, sanitized: '' };
  
  if (!clean.startsWith('https://drive.google.com/') && !clean.startsWith('https://docs.google.com/')) {
    return {
      isValid: false,
      error: 'कृपया अधिकृत Google Drive लिंक द्या (URL must start with https://drive.google.com/).',
      sanitized: clean
    };
  }
  return { isValid: true, error: null, sanitized: clean };
}

/**
 * Validates Bank Details (IFSC, Account Number)
 * @param {Object} details 
 * @returns {{ isValid: boolean, error: string|null }}
 */
export function validateBankDetails({ accountNumber, ifscCode, accountHolder, bankName }) {
  if (accountNumber && !BANK_ACCOUNT_REGEX.test(String(accountNumber).trim())) {
    return { isValid: false, error: 'अवैध खाते क्रमांक! ९ ते १८ अंकी बँक खाते क्रमांक टाका (Account number must be 9-18 digits).' };
  }
  if (ifscCode) {
    const cleanIfsc = String(ifscCode).trim().toUpperCase();
    if (!IFSC_REGEX.test(cleanIfsc)) {
      return { isValid: false, error: 'अवैध IFSC कोड! कृपया ११ अंकी योग्य IFSC कोड टाका (e.g. SBIN0012345).' };
    }
  }
  return { isValid: true, error: null };
}

/**
 * Validates uploaded files by actual MIME type and file size
 * @param {File} file 
 * @param {Array<string>} allowedTypes 
 * @param {number} maxSizeBytes 
 * @returns {{ isValid: boolean, error: string|null }}
 */
export function validateUploadedFile(file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'], maxSizeBytes = 5 * 1024 * 1024) {
  if (!file) return { isValid: false, error: 'कोणतीही फाईल निवडलेली नाही (No file selected).' };
  
  // 1. MIME Type check
  if (!allowedTypes.includes(file.type)) {
    const allowedExts = allowedTypes.map(t => t.split('/')[1]?.toUpperCase() || t).join(', ');
    return {
      isValid: false,
      error: `अवैध फाईल प्रकार! फक्त ${allowedExts} फाईल्स स्वीकारल्या जातात (Only ${allowedExts} files allowed).`
    };
  }

  // 2. File size limit
  if (file.size > maxSizeBytes) {
    const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
    return {
      isValid: false,
      error: `फाईलचा आकार खूप मोठा आहे! कमाल मर्यादा ${maxMb}MB आहे (File size exceeds ${maxMb}MB limit).`
    };
  }

  // 3. Reject executable or dangerous file extensions
  const dangerousExts = ['.exe', '.sh', '.bat', '.cmd', '.js', '.vbs', '.php', '.html', '.htm', '.svg'];
  const fileNameLower = file.name.toLowerCase();
  for (const ext of dangerousExts) {
    if (fileNameLower.endsWith(ext)) {
      return {
        isValid: false,
        error: `असुरक्षित फाईल प्रकार (${ext}) अवरोधित केला आहे (Executable/script files blocked).`
      };
    }
  }

  return { isValid: true, error: null };
}

/**
 * Validates Task inputs
 * @param {string} title 
 * @returns {{ isValid: boolean, error: string|null, sanitized: string }}
 */
export function validateTaskTitle(title) {
  if (!title || typeof title !== 'string') {
    return { isValid: false, error: 'कृपया कामाचे नाव टाका (Please enter task title).', sanitized: '' };
  }
  const clean = sanitizeText(title);
  if (clean.length < 2) {
    return { isValid: false, error: 'कामाचे नाव किमान २ अक्षरांचे असावे (Task title must be at least 2 characters).', sanitized: clean };
  }
  if (clean.length > 250) {
    return { isValid: false, error: 'कामाचे नाव कमाल २५० अक्षरांपर्यंत असावे (Task title exceeds 250 characters).', sanitized: clean };
  }
  return { isValid: true, error: null, sanitized: clean };
}
