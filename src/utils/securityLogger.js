/**
 * Security Logging & Anomaly Monitoring Utility for Mandal Management
 * 
 * Capabilities:
 * 1. Centralized structured event logging (Cloud Logging & Console integration)
 * 2. Real-time logging of failed login attempts, rate limit lockouts, and permission-denied errors
 * 3. Client request burst detection (unusual volume from single source)
 * 4. In-memory and Firestore audit trail persistence
 */

import { db, isConfigured } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const LOCAL_AUDIT_LOG_KEY = 'ivmm_security_audit_trail_v1';
const MAX_LOCAL_LOGS = 50;

// In-memory sliding window for request rate monitoring
const requestCounters = new Map();

/**
 * Logs a security event to Console, Local Storage, and Cloud Firestore
 * @param {Object} event
 * @param {'FAILED_LOGIN'|'RATE_LIMIT_TRIGGERED'|'FIRESTORE_PERMISSION_DENIED'|'UNUSUAL_VOLUME_BURST'|'SESSION_EXPIRED'|'VALIDATION_ERROR'} event.type
 * @param {'INFO'|'WARN'|'CRITICAL'} event.severity
 * @param {string} event.message
 * @param {Object} [event.details]
 */
export async function logSecurityEvent({ type, severity = 'INFO', message, details = {} }) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    type,
    severity,
    message: message || type,
    details: sanitizeDetails(details),
    timestamp,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.hash || window.location.pathname : '/'
  };

  // 1. Structured Console Output (Captured automatically by Cloud Logging / Browser DevTools)
  const logPrefix = `[SECURITY AUDIT - ${severity}]`;
  if (severity === 'CRITICAL') {
    console.error(logPrefix, type, message, logEntry);
  } else if (severity === 'WARN') {
    console.warn(logPrefix, type, message, logEntry);
  } else {
    console.info(logPrefix, type, message, logEntry);
  }

  // 2. Persist to Local Storage Ring Buffer (Available offline & on organiser side)
  try {
    const raw = localStorage.getItem(LOCAL_AUDIT_LOG_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const updated = [logEntry, ...existing].slice(0, MAX_LOCAL_LOGS);
    localStorage.setItem(LOCAL_AUDIT_LOG_KEY, JSON.stringify(updated));
  } catch (e) {
    // Non-blocking fallback
  }

  // 3. Persist to Firestore securityLogs collection (Centralized Cloud Monitoring)
  if (isConfigured && db && typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      await addDoc(collection(db, 'securityLogs'), {
        type: logEntry.type,
        severity: logEntry.severity,
        message: String(logEntry.message).slice(0, 500),
        details: logEntry.details,
        timestamp: logEntry.timestamp,
        userAgent: logEntry.userAgent.slice(0, 200)
      });
    } catch (err) {
      // Non-blocking if offline or rules reject
      console.warn('[SECURITY LOGGER] Cloud sync fallback:', err?.code || err?.message);
    }
  }

  return logEntry;
}

/**
 * Retrieves the local security audit trail
 * @returns {Array<Object>}
 */
export function getLocalSecurityAuditLogs() {
  try {
    const raw = localStorage.getItem(LOCAL_AUDIT_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Monitors request bursts from a single source to detect abnormal volume spikes
 * @param {string} sourceKey Identifier for the action (e.g., 'vargani-submit', 'pin-verify')
 * @param {number} maxBurst Maximum allowed requests in the time window
 * @param {number} windowMs Time window in milliseconds (default 10s)
 * @returns {{ allowed: boolean, count: number }}
 */
export function checkRequestBurst(sourceKey = 'general', maxBurst = 12, windowMs = 10000) {
  const now = Date.now();
  const history = requestCounters.get(sourceKey) || [];
  
  // Keep only timestamps within sliding window
  const active = history.filter(ts => (now - ts) < windowMs);
  active.push(now);
  requestCounters.set(sourceKey, active);

  if (active.length > maxBurst) {
    logSecurityEvent({
      type: 'UNUSUAL_VOLUME_BURST',
      severity: 'WARN',
      message: `Unusual activity burst detected for '${sourceKey}': ${active.length} requests in ${Math.round(windowMs/1000)}s window.`,
      details: { sourceKey, count: active.length, windowMs }
    });
    return { allowed: false, count: active.length };
  }

  return { allowed: true, count: active.length };
}

/**
 * Sanitizes details to ensure no sensitive passwords, raw PINs or secrets are stored in logs
 * @param {Object} details 
 * @returns {Object}
 */
function sanitizeDetails(details = {}) {
  if (!details || typeof details !== 'object') return {};
  const sanitized = { ...details };
  
  // Redact any raw PIN or secret keys if accidentally passed
  const sensitiveKeys = ['pin', 'password', 'token', 'secret', 'key'];
  for (const k of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => k.toLowerCase().includes(sk))) {
      sanitized[k] = '[REDACTED]';
    }
    if (k === 'phone' && typeof sanitized[k] === 'string') {
      // Mask middle digits of phone numbers for privacy
      const clean = sanitized[k].replace(/\D/g, '');
      if (clean.length >= 10) {
        sanitized[k] = `${clean.slice(0, 2)}******${clean.slice(-2)}`;
      }
    }
  }
  return sanitized;
}
