import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, isConfigured } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import {
  verifyPinHash,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  createSecureSession,
  validateSession,
  clearSession
} from '../utils/security';
import { logSecurityEvent } from '../utils/securityLogger';

const AuthContext = createContext();

export const DEFAULT_ORGANIZERS = [
  { id: 'org-default-1', name: 'Digambar Patil', phone: '8767977216' }
];

export function AuthProvider({ children }) {
  const [organizers, setOrganizers] = useState(() => {
    try {
      const saved = localStorage.getItem('mandal_organizers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(({ pin, role, ...rest }) => rest);
        }
      }
      return DEFAULT_ORGANIZERS;
    } catch {
      return DEFAULT_ORGANIZERS;
    }
  });

  const [currentOrganizer, setCurrentOrganizer] = useState(() => {
    try {
      const val = validateSession();
      return val.isValid ? val.session.organizer : null;
    } catch {
      return null;
    }
  });

  // Local storage persistence fallback for organizers directory
  useEffect(() => {
    localStorage.setItem('mandal_organizers', JSON.stringify(organizers));
  }, [organizers]);

  // Periodic and on-focus session expiration check (30-day inactivity TTL)
  useEffect(() => {
    const checkSessionExpiration = () => {
      const val = validateSession();
      if (!val.isValid && currentOrganizer) {
        console.warn('Session expired or invalidated:', val.reason);
        setCurrentOrganizer(null);
      }
    };

    const interval = setInterval(checkSessionExpiration, 60000); // Check every minute
    window.addEventListener('focus', checkSessionExpiration);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkSessionExpiration);
    };
  }, [currentOrganizer]);

  // Live Firestore subscription for Organisers list
  useEffect(() => {
    if (!isConfigured || !db) return;

    try {
      const unsubOrganizers = onSnapshot(doc(db, 'organizers', 'main'), (snapshot) => {
        if (snapshot.exists() && Array.isArray(snapshot.data()?.list) && snapshot.data().list.length > 0) {
          const list = snapshot.data().list.map(({ pin, role, ...rest }) => rest);
          setOrganizers(list);
        } else {
          // Seed default organiser Digambar Patil into Firestore if empty
          setDoc(doc(db, 'organizers', 'main'), { list: DEFAULT_ORGANIZERS }, { merge: true }).catch(() => {});
          setOrganizers(DEFAULT_ORGANIZERS);
        }
      }, (err) => console.warn('Firestore Organizers listener error:', err));

      return () => unsubOrganizers();
    } catch (e) {
      console.warn('Firestore organizers subscription fallback:', e);
    }
  }, []);

  // Login via salted SHA-256 PIN hash with Anti-Brute-Force Rate Limiting
  const loginWithPin = async (pin, name, phone, selectedOrgId) => {
    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10) || (selectedOrgId || 'global');

    // 1. Anti-Brute-Force Rate Limiting Check (5 attempts / 15 mins)
    const rateLimit = checkRateLimit(cleanPhone);
    if (!rateLimit.allowed) {
      logSecurityEvent({
        type: 'RATE_LIMIT_TRIGGERED',
        severity: 'CRITICAL',
        message: `Login lockout active on target: ${cleanPhone}. Further attempts blocked.`,
        details: { phone: cleanPhone, lockTimeRemainingMs: rateLimit.lockTimeRemainingMs }
      });
      return {
        success: false,
        error: rateLimit.message,
        isLocked: true,
        lockTimeRemainingMs: rateLimit.lockTimeRemainingMs
      };
    }

    // 2. Cryptographic Salted SHA-256 Hash Verification (Zero plaintext in bundle)
    const isValidPin = await verifyPinHash(pin);
    if (!isValidPin) {
      const failed = recordFailedAttempt(cleanPhone);
      logSecurityEvent({
        type: failed.locked ? 'RATE_LIMIT_TRIGGERED' : 'FAILED_LOGIN',
        severity: failed.locked ? 'CRITICAL' : 'WARN',
        message: failed.locked
          ? `Account locked: 5 consecutive invalid PIN attempts on ${cleanPhone}.`
          : `Failed PIN attempt on ${cleanPhone}.`,
        details: { phone: cleanPhone, locked: failed.locked, remainingAttempts: 5 }
      });
      return {
        success: false,
        error: failed.message,
        isLocked: failed.locked,
        lockTimeRemainingMs: failed.lockTimeRemainingMs
      };
    }

    // 3. Reset rate limit counter on successful authentication
    resetRateLimit(cleanPhone);

    // 4. Match selected organizer from dropdown
    let targetOrg = null;
    if (selectedOrgId) {
      const found = organizers.find(o => o.id === selectedOrgId);
      if (found) {
        targetOrg = { ...found, phone: phone ? phone.trim() : found.phone };
      }
    }

    // 5. Match existing organizer by phone or name
    if (!targetOrg) {
      const cleanName = (name || '').trim().toLowerCase();
      targetOrg = organizers.find(o => {
        const oPhone = (o.phone || '').replace(/\D/g, '').slice(-10);
        const oName = (o.name || '').trim().toLowerCase();
        if (cleanPhone && oPhone && oPhone === cleanPhone) return true;
        if (cleanName && oName && oName === cleanName) return true;
        return false;
      });
    }

    // 6. If not matched, but valid name entered with valid master PIN -> Register and login
    if (!targetOrg && name && name.trim()) {
      targetOrg = {
        id: `org-${Date.now()}`,
        name: name.trim(),
        phone: cleanPhone || ''
      };
      const updated = [...organizers, targetOrg];
      setOrganizers(updated);
      if (isConfigured && db) {
        setDoc(doc(db, 'organizers', 'main'), { list: updated }, { merge: true }).catch(() => {});
      }
    }

    if (!targetOrg) {
      return {
        success: false,
        error: 'कृपया आपले पूर्ण नाव लिहा (Please enter your name).'
      };
    }

    // 7. Create secure session with 30-day inactivity TTL and cryptographic token
    createSecureSession(targetOrg);
    setCurrentOrganizer(targetOrg);
    return { success: true, organizer: targetOrg };
  };

  const logout = () => {
    clearSession();
    setCurrentOrganizer(null);
  };

  const addOrganizer = async ({ name, phone }) => {
    if (!name || !name.trim()) return null;
    const newOrg = {
      id: `org-${Date.now()}`,
      name: name.trim(),
      phone: phone ? phone.trim().replace(/\D/g, '').slice(-10) : ''
    };
    const updated = [...organizers, newOrg];
    setOrganizers(updated);

    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'organizers', 'main'), { list: updated }, { merge: true });
      } catch (e) {
        console.warn('Firestore addOrganizer error:', e);
      }
    }
    return newOrg;
  };

  const updateOrganizer = async (id, { name, phone }) => {
    const updated = organizers.map(o => {
      if (o.id === id) {
        return {
          ...o,
          name: name ? name.trim() : o.name,
          phone: phone ? phone.trim().replace(/\D/g, '').slice(-10) : o.phone
        };
      }
      return o;
    });
    setOrganizers(updated);

    if (currentOrganizer?.id === id) {
      setCurrentOrganizer(prev => ({
        ...prev,
        name: name ? name.trim() : prev.name,
        phone: phone ? phone.trim().replace(/\D/g, '').slice(-10) : prev.phone
      }));
    }

    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'organizers', 'main'), { list: updated }, { merge: true });
      } catch (e) {
        console.warn('Firestore updateOrganizer error:', e);
      }
    }
  };

  const removeOrganizer = async (id) => {
    const updated = organizers.filter(o => o.id !== id);
    setOrganizers(updated);
    if (currentOrganizer?.id === id) {
      clearSession();
      setCurrentOrganizer(null);
    }

    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'organizers', 'main'), { list: updated }, { merge: true });
      } catch (e) {
        console.warn('Firestore removeOrganizer error:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        organizers,
        currentOrganizer,
        isAuthenticated: !!currentOrganizer,
        loginWithPin,
        logout,
        addOrganizer,
        updateOrganizer,
        removeOrganizer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
