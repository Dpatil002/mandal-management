import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, isConfigured } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const MASTER_PIN = '1995';

export const DEFAULT_ORGANIZERS = [
  { id: 'org-1', name: 'Sachin Joshi', phone: '9820011223', pin: MASTER_PIN },
  { id: 'org-2', name: 'Vijay Pawar', phone: '9820044556', pin: MASTER_PIN },
  { id: 'org-3', name: 'Amit Kadam', phone: '9820077889', pin: MASTER_PIN },
  { id: 'org-4', name: 'Sunita Deshmukh', phone: '9820099001', pin: MASTER_PIN },
  { id: 'org-5', name: 'Ramesh Shinde', phone: '9820022334', pin: MASTER_PIN },
  { id: 'org-6', name: 'Pranav Patil', phone: '9820055667', pin: MASTER_PIN }
];

export function AuthProvider({ children }) {
  const [organizers, setOrganizers] = useState(() => {
    try {
      const saved = localStorage.getItem('mandal_organizers');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(({ role, ...rest }) => ({ ...rest, pin: MASTER_PIN }));
      }
      return DEFAULT_ORGANIZERS;
    } catch {
      return DEFAULT_ORGANIZERS;
    }
  });

  const [currentOrganizer, setCurrentOrganizer] = useState(() => {
    try {
      const saved = localStorage.getItem('mandal_active_organizer');
      if (saved) {
        const { role, ...rest } = JSON.parse(saved);
        return { ...rest, pin: MASTER_PIN };
      }
      return null;
    } catch {
      return null;
    }
  });

  // Local storage persistence fallback
  useEffect(() => {
    localStorage.setItem('mandal_organizers', JSON.stringify(organizers));
  }, [organizers]);

  useEffect(() => {
    if (currentOrganizer) {
      localStorage.setItem('mandal_active_organizer', JSON.stringify(currentOrganizer));
    } else {
      localStorage.removeItem('mandal_active_organizer');
    }
  }, [currentOrganizer]);

  // Live Firestore subscription for Organisers list
  useEffect(() => {
    if (!isConfigured || !db) return;

    try {
      const unsubOrganizers = onSnapshot(doc(db, 'organizers', 'main'), (snapshot) => {
        if (snapshot.exists() && Array.isArray(snapshot.data()?.list)) {
          const list = snapshot.data().list.map(o => ({ ...o, pin: MASTER_PIN }));
          setOrganizers(list);
        } else {
          // Seed default organizers into Firestore if empty
          setDoc(doc(db, 'organizers', 'main'), { list: DEFAULT_ORGANIZERS }, { merge: true }).catch(() => {});
        }
      }, (err) => console.warn('Firestore Organizers listener error:', err));

      return () => unsubOrganizers();
    } catch (e) {
      console.warn('Firestore organizers subscription fallback:', e);
    }
  }, []);

  // Login via developer-locked MASTER_PIN (1995) and name/mobile
  const loginWithPin = (pin, name, phone, selectedOrgId) => {
    const isValidPin = String(pin).trim() === MASTER_PIN;
    if (!isValidPin) {
      return { success: false, error: 'चुकीचा पिन! कृपया योग्य ४ अंकी पिन टाका.' };
    }

    // Must match an active organizer in the list
    if (selectedOrgId) {
      const found = organizers.find(o => o.id === selectedOrgId);
      if (found) {
        const userSession = { ...found, phone: phone ? phone.trim() : found.phone, pin: MASTER_PIN };
        setCurrentOrganizer(userSession);
        return { success: true, organizer: userSession };
      } else {
        return { success: false, error: 'कार्यकर्ता नोंद सापडली नाही. (Organiser profile not found)' };
      }
    }

    // Match existing organizer by phone or name
    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    const cleanName = (name || '').trim().toLowerCase();

    let matched = organizers.find(o => {
      const oPhone = (o.phone || '').replace(/\D/g, '').slice(-10);
      const oName = (o.name || '').trim().toLowerCase();
      if (cleanPhone && oPhone && oPhone === cleanPhone) return true;
      if (cleanName && oName && oName === cleanName) return true;
      return false;
    });

    if (!matched) {
      return {
        success: false,
        error: 'हे नाव किंवा मोबाईल नंबर कार्यकर्ते यादीत नोंद नाही. (Name or mobile not registered as organiser)'
      };
    }

    const session = { ...matched, pin: MASTER_PIN };
    setCurrentOrganizer(session);
    return { success: true, organizer: session };
  };

  const logout = () => {
    setCurrentOrganizer(null);
  };

  const addOrganizer = async ({ name, phone }) => {
    if (!name || !name.trim()) return null;
    const newOrg = {
      id: `org-${Date.now()}`,
      name: name.trim(),
      phone: phone ? phone.trim().replace(/\D/g, '').slice(-10) : '',
      pin: MASTER_PIN
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
          phone: phone ? phone.trim().replace(/\D/g, '').slice(-10) : o.phone,
          pin: MASTER_PIN
        };
      }
      return o;
    });
    setOrganizers(updated);

    if (currentOrganizer?.id === id) {
      setCurrentOrganizer(prev => ({
        ...prev,
        name: name ? name.trim() : prev.name,
        phone: phone ? phone.trim().replace(/\D/g, '').slice(-10) : prev.phone,
        pin: MASTER_PIN
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
