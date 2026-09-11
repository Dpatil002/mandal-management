import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, isConfigured } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { generateReceiptNumber } from '../utils/formatters';

const MandalDataContext = createContext();

const INITIAL_MANDAL_CONFIG = {
  name: 'इंद्रायणी विहार मित्र मंडळ',
  englishName: 'Indrayani Vihar Mitra Mandal',
  subtitle: 'सार्वजनिक गणेशोत्सव २०२६ • ३२ वे वर्ष',
  location: 'Indrayani Vihar, Lohegaon, Pune',
  year: 2026,
  upiId: 'indrayanivihar@upi',
  president: 'Sachin Joshi',
  treasurer: 'Vijay Pawar',
  targetGoal: 250000,
  driveUrl: 'https://photos.google.com/',
  helplinePhone: '9820011223'
};

const INITIAL_PUBLIC_CONTENT = {
  morningAartiTime: '10:00 AM',
  morningAartiMarathiTime: 'सकाळी १०:००',
  morningAartiTitle: 'Morning Aarti (सकाळची आरती)',
  morningAartiNote: 'Modak prasad distribution',
  eveningAartiTime: '8:00 PM',
  eveningAartiMarathiTime: 'रात्री ८:००',
  eveningAartiTitle: 'Evening Maha Aarti (संध्याकाळची महाआरती)',
  eveningAartiNote: '101 Deepa Maha Aarti',
  todayEventName: 'Bal Gopal Competition',
  todayEventMarathiName: 'बाल गोपाळ नृत्य स्पर्धा',
  todayEventTime: '6:00 PM',
  todayEventLocation: 'Main Stage (मुख्य मंडप)',
  todayEventDay: 'Day 4 • चतुर्थी',
  varganiMessage: 'सहकार्य आणि भक्तीभावाने उत्सव साजरा करूया.',
  announcementTitle: 'Grand Mahaprasad on Anant Chaturdashi',
  announcementSub: 'Collect tokens from society office'
};

const INITIAL_CULTURAL_EVENTS = [
  {
    id: 'ce-1',
    day: 1,
    dayLabel: 'Day 1 • गणेश चतुर्थी',
    date: '07 Sept',
    title: 'Ganesh Stapan & Atharvashirsha Pathan',
    marathiTitle: 'गणेश स्थापना व सामूहिक अथर्वशीर्ष पठण',
    time: '06:00 PM',
    location: 'Main Stage (मुख्य मंडप)',
    performers: 'Indrayani Mahila Mandal & Kids',
    description: 'सामूहिक अथर्वशीर्ष २१ आवर्तने व बालकलाकारांचे स्वागत गीत'
  },
  {
    id: 'ce-2',
    day: 2,
    dayLabel: 'Day 2 • ऋषीपंचमी',
    date: '08 Sept',
    title: 'Drawing & Modak Making Competition',
    marathiTitle: 'बाल चित्रकला व पर्यावरणपूरक मोदक स्पर्धा',
    time: '05:30 PM',
    location: 'Society Community Hall',
    performers: 'Society Children (Age 5-15)',
    description: 'गणेशोत्सव संकल्पना चित्रकला व हस्तकला प्रदर्शन'
  },
  {
    id: 'ce-3',
    day: 3,
    dayLabel: 'Day 3 • तृतीया',
    date: '09 Sept',
    title: 'Mahila Bhajan Mandal & Traditional Songs',
    marathiTitle: 'महिला भजन मंडळ व पारंपरिक भक्तीगीते',
    time: '06:30 PM',
    location: 'Main Stage (मुख्य मंडप)',
    performers: 'Indrayani Swar Tarang Group',
    description: 'अभंग, भारुड व पारंपरिक गवळणींचे सुश्राव्य सादरीकरण'
  },
  {
    id: 'ce-4',
    day: 4,
    dayLabel: 'Day 4 • चतुर्थी',
    date: '10 Sept',
    title: 'Children Dance, Drama & Skits',
    marathiTitle: 'बाल गोपाळ नृत्य, नाटिका व कलाविष्कार',
    time: '06:00 PM',
    location: 'Main Stage (मुख्य मंडप)',
    performers: 'Indrayani Bal Kala Manch',
    description: 'इंद्रायणी विहार बाल कलाकार सादरीकरण व नृत्य स्पर्धा'
  },
  {
    id: 'ce-5',
    day: 5,
    dayLabel: 'Day 5 • पंचमी',
    date: '11 Sept',
    title: 'Musical Night & Classical Sugam Sangeet',
    marathiTitle: 'सुगम संगीत संध्या व वाद्यवृंद',
    time: '07:00 PM',
    location: 'Main Stage (मुख्य मंडप)',
    performers: 'Sur Sargam Music Troupe',
    description: 'नाट्यसंगीत, भावगीते व भक्तीरचनांची सुरेल मैफल'
  },
  {
    id: 'ce-6',
    day: 6,
    dayLabel: 'Day 6 • षष्ठी',
    date: '12 Sept',
    title: 'Fancy Dress Competition (Historical & Saints)',
    marathiTitle: 'भव्य वेशभूषा स्पर्धा (संत व क्रांतिकारक)',
    time: '05:30 PM',
    location: 'Main Stage (मुख्य मंडप)',
    performers: 'All Society Kids & Youth',
    description: 'ऐतिहासिक व्यक्तिमत्त्व व संतांच्या वेषातील संवाद सादरीकरण'
  },
  {
    id: 'ce-7',
    day: 7,
    dayLabel: 'Day 7 • सप्तमी',
    date: '13 Sept',
    title: 'Family Antakshari & Fun Cultural Games',
    marathiTitle: 'कौटुंबिक अंताक्षरी व सांस्कृतिक खेळ',
    time: '06:30 PM',
    location: 'Society Amphitheatre',
    performers: 'All Residents & Families',
    description: 'सोसायटीतील सर्व विंग्समधील कुटुंबियांची महा-अंताक्षरी'
  },
  {
    id: 'ce-8',
    day: 8,
    dayLabel: 'Day 8 • अष्टमी',
    date: '14 Sept',
    title: 'Dhol-Tasha & Traditional Lezim Showcase',
    marathiTitle: 'ढोल-ताशा व पारंपरिक लेझीम प्रात्यक्षिक',
    time: '06:00 PM',
    location: 'Main Ground / मुख्य प्रांगण',
    performers: 'Indrayani Yuva Dhol Pathak',
    description: 'भव्य वादन प्रात्यक्षिक व शिवकालीन युद्धकला लेझीम'
  },
  {
    id: 'ce-9',
    day: 9,
    dayLabel: 'Day 9 • नवमी',
    date: '15 Sept',
    title: 'Shree Satyanarayan Pooja & Bhajan Sandhya',
    marathiTitle: 'श्री सत्यनारायण महापूजा व महाप्रसाद',
    time: '05:00 PM',
    location: 'Main Mandap & Stage',
    performers: 'Panditji & Bhaktimandal',
    description: 'सामूहिक महापूजा, सत्यनारायण कथा व महाप्रसाद वाटप'
  },
  {
    id: 'ce-10',
    day: 10,
    dayLabel: 'Day 10 • अनंत चतुर्दशी',
    date: '16 Sept',
    title: 'Grand Farewell Miravnuk & Aarti',
    marathiTitle: 'भव्य विसर्जन मिरवणूक व निरोप आरती',
    time: '04:00 PM',
    location: 'Indrayani Vihar to Visarjan Ghat',
    performers: 'Entire Indrayani Vihar Family',
    description: 'गुलाल, पुष्पवृष्टी व ढोल-ताशा गजरात बाप्पाला भावपूर्ण निरोप'
  }
];

const INITIAL_MANKARI_LIST = [
  { id: 'mk-1', day: 'Day 1', date: '07 Sept', family: 'कदम परिवार', flat: 'A-102', aarti: 'Evening' },
  { id: 'mk-2', day: 'Day 1', date: '07 Sept', family: 'पाटील कुटुंब', flat: 'B-304', aarti: 'Evening' },
  { id: 'mk-3', day: 'Day 2', date: '08 Sept', family: 'पवार परिवार', flat: 'C-201', aarti: 'Evening' },
  { id: 'mk-4', day: 'Day 3', date: '09 Sept', family: 'जोशी कुटुंब', flat: 'A-504', aarti: 'Evening' },
  { id: 'mk-5', day: 'Day 4', date: '10 Sept', family: 'श्रीमंत कदम परिवार', flat: 'A-102', aarti: 'Evening' },
  { id: 'mk-6', day: 'Day 4', date: '10 Sept', family: 'पाटील कुटुंब', flat: 'B-304', aarti: 'Evening' },
  { id: 'mk-7', day: 'Day 4', date: '10 Sept', family: 'देशमुख परिवार', flat: 'C-201', aarti: 'Evening' },
  { id: 'mk-8', day: 'Day 4', date: '10 Sept', family: 'जोशी कुटुंब', flat: 'A-504', aarti: 'Evening' },
  { id: 'mk-9', day: 'Day 4', date: '10 Sept', family: 'सावंत परिवार', flat: 'B-101', aarti: 'Evening' },
  { id: 'mk-10', day: 'Day 4', date: '10 Sept', family: 'कुलकर्णी परिवार', flat: 'D-302', aarti: 'Evening' },
  { id: 'mk-11', day: 'Day 5', date: '11 Sept', family: 'शिंदे परिवार', flat: 'B-202', aarti: 'Evening' },
  { id: 'mk-12', day: 'Day 6', date: '12 Sept', family: 'गायकवाड कुटुंब', flat: 'C-405', aarti: 'Evening' }
];

const INITIAL_VARGANI = [
  {
    id: 'v-1',
    receiptNo: '#IV-2026-089',
    donorName: 'Santosh Kulkarni',
    wingFlat: 'B-402',
    phone: '9820123456',
    amount: 2100,
    mode: 'UPI',
    status: 'verified',
    utr: '428901234567',
    screenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=60',
    collectedBy: 'Vijay Pawar (Treasurer)',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    notes: 'Aarti sponsorship & special puja'
  },
  {
    id: 'v-2',
    receiptNo: '#IV-2026-088',
    donorName: 'Deepak & Sunita Deshmukh',
    wingFlat: 'A-104',
    phone: '9819876543',
    amount: 5001,
    mode: 'UPI',
    status: 'verified',
    utr: '428812349876',
    screenshotUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&auto=format&fit=crop&q=60',
    collectedBy: 'Sachin Joshi (President)',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    notes: 'Annual building vargani'
  },
  {
    id: 'v-3',
    receiptNo: '#IV-2026-087',
    donorName: 'Mahesh Jewellers (Sponsor)',
    wingFlat: 'Shop No 4',
    phone: '9892345678',
    amount: 25000,
    mode: 'Bank Transfer',
    status: 'verified',
    utr: '428756473829',
    screenshotUrl: '',
    collectedBy: 'Vijay Pawar (Treasurer)',
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    notes: 'Main Stage & Lighting banner sponsor'
  },
  {
    id: 'v-4',
    receiptNo: '#IV-2026-086',
    donorName: 'Anil Jadhav',
    wingFlat: 'C-302',
    phone: '9833445566',
    amount: 1001,
    mode: 'UPI',
    status: 'pending',
    utr: '428612345098',
    screenshotUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=60',
    collectedBy: 'Online Portal',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    notes: 'Submitted via Public Portal'
  },
  {
    id: 'v-5',
    receiptNo: '#IV-2026-085',
    donorName: 'Priya & Rajesh Sharma',
    wingFlat: 'D-601',
    phone: '9821001122',
    amount: 3500,
    mode: 'Cash',
    status: 'verified',
    utr: '',
    screenshotUrl: '',
    collectedBy: 'Amit Kadam',
    createdAt: new Date().toISOString(),
    notes: 'Modak Prasad contribution'
  }
];

const INITIAL_EXPENSES = [
  {
    id: 'e-1',
    title: 'Eco-Friendly Pandal & Stage Mandap',
    category: 'Decoration',
    amount: 28000,
    vendor: 'Shiv Mandap Decorators',
    paidBy: 'Vijay Pawar',
    date: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    receiptUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=400&auto=format&fit=crop&q=60',
    notes: 'Full pandal & floral entrance'
  },
  {
    id: 'e-2',
    title: 'Sound System, DJ & Lighting Setup',
    category: 'Sound & Lights',
    amount: 18500,
    vendor: 'Om Sound & Vision',
    paidBy: 'Vijay Pawar',
    date: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    receiptUrl: '',
    notes: 'Sound equipment for 10 days'
  },
  {
    id: 'e-3',
    title: 'Shree Ganpati Murti Advance & Poojan Items',
    category: 'Murti',
    amount: 15000,
    vendor: 'Pen Clay Sculptors',
    paidBy: 'Sachin Joshi (President)',
    date: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    receiptUrl: '',
    notes: 'Eco-friendly clay murti'
  },
  {
    id: 'e-4',
    title: 'Maha Prasad & Modak Distribution (Day 1)',
    category: 'Mahaprasad',
    amount: 8200,
    vendor: 'Shree Krishna Sweets',
    paidBy: 'Amit Kadam (Secretary)',
    date: new Date().toISOString(),
    receiptUrl: '',
    notes: 'Prasad for 600 devotees'
  }
];

const INITIAL_TASKS = [
  { id: 't-1', title: 'Morning Aarti (सकाळची आरती व नैवेद्य)', time: '07:30 AM', assignedTo: 'Sachin Joshi', status: 'done', category: 'Ritual' },
  { id: 't-2', title: 'Prasad Distribution Counter Setup', time: '11:00 AM', assignedTo: 'Sunita Deshmukh', status: 'done', category: 'Seva' },
  { id: 't-3', title: 'Collect Vargani from Wing C & D', time: '04:30 PM', assignedTo: 'Amit Kadam', status: 'todo', category: 'Vargani' },
  { id: 't-4', title: 'Evening Maha Aarti & Dhol Tasha Pathak', time: '08:00 PM', assignedTo: 'Pranav Patil', status: 'todo', category: 'Ritual' },
  { id: 't-5', title: 'Daily Cash Counting & Tally with Treasurer', time: '10:30 PM', assignedTo: 'Vijay Pawar', status: 'todo', category: 'Accounts' }
];

const INITIAL_DHOL_INVENTORY = {
  dhol: 24,
  tasha: 12,
  dhwaja: 8,
  tol: 16
};

const INITIAL_DHOL_MAINTENANCE = [
  {
    id: 'dm-1',
    instrumentType: 'Dhol Leather Tightening & Strings',
    amount: 4200,
    servicedBy: 'Kolhapur Vadya Kendra',
    date: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    notes: 'Tightened leather rings and replaced 6 cords'
  },
  {
    id: 'dm-2',
    instrumentType: 'Tasha Snare Wire & Brass Polish',
    amount: 2800,
    servicedBy: 'Pune Vadya Shala',
    date: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    notes: 'Replaced 4 snare wires and balanced heads'
  },
  {
    id: 'dm-3',
    instrumentType: 'Dhwaja Brass Rings & Silk Banners',
    amount: 1500,
    servicedBy: 'Maharashtrian Flag Works',
    date: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    notes: 'Ironed saffron flags and lubricated poles'
  }
];

const INITIAL_DHOL_STORAGE = [
  {
    id: 'ds-1',
    personName: 'Sachin Joshi',
    phone: '9820011223',
    location: 'A-Wing Parking Storage',
    dholCount: 8,
    tashaCount: 4,
    status: 'In Storage',
    date: '2026-09-01',
    notes: 'Includes 8 pairs of sticks & 4 stands'
  },
  {
    id: 'ds-2',
    personName: 'Vijay Pawar',
    phone: '9820044556',
    location: 'B-Wing Ground Floor Society Store',
    dholCount: 10,
    tashaCount: 5,
    status: 'In Storage',
    date: '2026-09-01',
    notes: 'Covered with waterproof tarp'
  },
  {
    id: 'ds-3',
    personName: 'Ramesh Shinde',
    phone: '9820022334',
    location: 'C-Wing Basement Room',
    dholCount: 6,
    tashaCount: 3,
    status: 'In Storage',
    date: '2026-09-02',
    notes: 'Kept with Dhwaja & poles'
  }
];

const INITIAL_SCHEDULE = [
  { id: 'sc-1', time: '07:30 AM', title: 'Morning Aarti & Abhishek', marathiTitle: 'सकाळची मंगल आरती व अभिषेक', type: 'aarti', priest: 'Pandit Sharma', mankari: 'Deshmukh Family (A-102)' },
  { id: 'sc-2', time: '10:00 AM', title: 'Devotee Darshan & Bhajana Mandal', marathiTitle: 'भाविकांचे दर्शन व महिला भजन मंडळ', type: 'darshan', mankari: 'Mahila Bhajan Mandal' },
  { id: 'sc-3', time: '01:00 PM', title: 'Maha Prasad Distribution', marathiTitle: 'महाप्रसाद वाटप व अन्नदान', type: 'prasad', mankari: 'Pawar Family (C-201)' },
  { id: 'sc-4', time: '05:30 PM', title: 'Children Drawing & Modak Competition', marathiTitle: 'बालचित्रकला व मोदक स्पर्धा', type: 'cultural', mankari: 'Youth Wing' },
  { id: 'sc-5', time: '08:00 PM', title: 'Evening Grand Maha Aarti & Dhol-Tasha', marathiTitle: 'संध्याकाळची महाआरती व ढोल-ताशा गजर', type: 'aarti', priest: 'All Organizers', mankari: 'Kulkarni Family (B-404)' },
  { id: 'sc-6', time: '10:30 PM', title: 'Daily Darshan Close & Accounts Tally', marathiTitle: 'दर्शन समाप्ती व हिशोब तपासणी', type: 'accounts', mankari: 'Vijay Pawar & Sachin Joshi' }
];

export function MandalDataProvider({ children }) {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('iv_mandal_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.location || parsed.location.includes('सेक्टर ४') || parsed.location.includes('Sector 4')) {
          parsed.location = 'Indrayani Vihar, Lohegaon, Pune';
        }
        return { ...INITIAL_MANDAL_CONFIG, ...parsed, location: parsed.location || 'Indrayani Vihar, Lohegaon, Pune' };
      }
      return INITIAL_MANDAL_CONFIG;
    } catch {
      return INITIAL_MANDAL_CONFIG;
    }
  });

  const [vargani, setVargani] = useState(() => {
    try {
      const saved = localStorage.getItem('iv_mandal_vargani');
      return saved ? JSON.parse(saved) : INITIAL_VARGANI;
    } catch {
      return INITIAL_VARGANI;
    }
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem('iv_mandal_expenses');
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('iv_mandal_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [dholInventory, setDholInventory] = useState(() => {
    try {
      const saved = localStorage.getItem('iv_dhol_inventory');
      return saved ? JSON.parse(saved) : INITIAL_DHOL_INVENTORY;
    } catch {
      return INITIAL_DHOL_INVENTORY;
    }
  });

  const [dholMaintenance, setDholMaintenance] = useState(() => {
    try {
      const saved = localStorage.getItem('iv_dhol_maintenance');
      return saved ? JSON.parse(saved) : INITIAL_DHOL_MAINTENANCE;
    } catch {
      return INITIAL_DHOL_MAINTENANCE;
    }
  });

  const [dholStorage, setDholStorage] = useState(() => {
    try {
      const saved = localStorage.getItem('iv_dhol_storage');
      return saved ? JSON.parse(saved) : INITIAL_DHOL_STORAGE;
    } catch {
      return INITIAL_DHOL_STORAGE;
    }
  });

  const [schedule, setSchedule] = useState(() => {
    try {
      const saved = localStorage.getItem('iv_schedule');
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
    } catch {
      return INITIAL_SCHEDULE;
    }
  });

  const [publicContent, setPublicContent] = useState(() => {
    try {
      const saved = localStorage.getItem('iv_public_content');
      return saved ? JSON.parse(saved) : INITIAL_PUBLIC_CONTENT;
    } catch {
      return INITIAL_PUBLIC_CONTENT;
    }
  });

  const [mankariList, setMankariList] = useState(() => {
    try {
      const saved = localStorage.getItem('iv_mankari_list');
      return saved ? JSON.parse(saved) : INITIAL_MANKARI_LIST;
    } catch {
      return INITIAL_MANKARI_LIST;
    }
  });

  const [culturalEvents, setCulturalEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('iv_cultural_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_CULTURAL_EVENTS;
    } catch {
      return INITIAL_CULTURAL_EVENTS;
    }
  });

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('iv_mandal_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('iv_mandal_vargani', JSON.stringify(vargani));
  }, [vargani]);

  useEffect(() => {
    localStorage.setItem('iv_mandal_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('iv_mandal_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('iv_dhol_inventory', JSON.stringify(dholInventory));
  }, [dholInventory]);

  useEffect(() => {
    localStorage.setItem('iv_dhol_maintenance', JSON.stringify(dholMaintenance));
  }, [dholMaintenance]);

  useEffect(() => {
    localStorage.setItem('iv_dhol_storage', JSON.stringify(dholStorage));
  }, [dholStorage]);

  useEffect(() => {
    localStorage.setItem('iv_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('iv_public_content', JSON.stringify(publicContent));
  }, [publicContent]);

  useEffect(() => {
    localStorage.setItem('iv_mankari_list', JSON.stringify(mankariList));
  }, [mankariList]);

  useEffect(() => {
    localStorage.setItem('iv_cultural_events', JSON.stringify(culturalEvents));
  }, [culturalEvents]);

  // Online / Offline window listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Optional Live Firestore Sync
  useEffect(() => {
    if (!isConfigured || !db) return;

    try {
      const unsubVargani = onSnapshot(collection(db, 'vargani'), (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setVargani(list);
        }
      }, (err) => console.warn('Firestore Vargani listener:', err));

      const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setExpenses(list);
        }
      }, (err) => console.warn('Firestore Expenses listener:', err));

      return () => {
        unsubVargani();
        unsubExpenses();
      };
    } catch (e) {
      console.warn('Firestore subscription fallback:', e);
    }
  }, []);

  // Add Vargani
  const addVargani = async (data) => {
    const nextReceiptNo = generateReceiptNumber(vargani.length + 1, config.year);
    const newEntry = {
      ...data,
      receiptNo: data.receiptNo || nextReceiptNo,
      createdAt: data.createdAt || new Date().toISOString(),
      amount: Number(data.amount) || 0,
      status: data.status || 'verified'
    };

    if (isConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'vargani'), newEntry);
        newEntry.id = docRef.id;
      } catch (e) {
        console.warn('Firestore addDoc fallback:', e);
        newEntry.id = `v-${Date.now()}`;
      }
    } else {
      newEntry.id = `v-${Date.now()}`;
    }

    setVargani(prev => [newEntry, ...prev]);
    return newEntry;
  };

  // Update Vargani (e.g. Verify / Unverify)
  const updateVargani = async (id, updatedData) => {
    setVargani(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updatedData } : item))
    );

    if (isConfigured && db) {
      try {
        await updateDoc(doc(db, 'vargani', id), updatedData);
      } catch (e) {
        console.warn('Firestore updateDoc error:', e);
      }
    }
  };

  // Delete Vargani
  const deleteVargani = async (id) => {
    setVargani(prev => prev.filter(item => item.id !== id));
    if (isConfigured && db) {
      try {
        await deleteDoc(doc(db, 'vargani', id));
      } catch (e) {
        console.warn('Firestore deleteDoc error:', e);
      }
    }
  };

  // Add Expense
  const addExpense = async (data) => {
    const newEntry = {
      ...data,
      date: data.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      amount: Number(data.amount) || 0
    };

    if (isConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'expenses'), newEntry);
        newEntry.id = docRef.id;
      } catch (e) {
        console.warn('Firestore expense addDoc error:', e);
        newEntry.id = `e-${Date.now()}`;
      }
    } else {
      newEntry.id = `e-${Date.now()}`;
    }

    setExpenses(prev => [newEntry, ...prev]);
    return newEntry;
  };

  // Delete Expense
  const deleteExpense = async (id) => {
    setExpenses(prev => prev.filter(item => item.id !== id));
    if (isConfigured && db) {
      try {
        await deleteDoc(doc(db, 'expenses', id));
      } catch (e) {
        console.warn('Firestore expense deleteDoc error:', e);
      }
    }
  };

  // Toggle Daily Task
  const toggleTask = (id) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t))
    );
  };

  const addTask = (task) => {
    setTasks(prev => [{ ...task, id: `t-${Date.now()}`, status: 'todo' }, ...prev]);
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Add Dhol Maintenance
  const addDholMaintenance = (entry) => {
    const newEntry = {
      ...entry,
      id: `dm-${Date.now()}`,
      date: entry.date || new Date().toISOString(),
      amount: Number(entry.amount) || 0
    };
    setDholMaintenance(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const updateDholInventory = (newCounts) => {
    setDholInventory(prev => ({ ...prev, ...newCounts }));
  };

  // Update Config
  const updateMandalConfig = (newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  // Dynamic Calculated Aggregates (strict requirement: never hardcoded)
  const totalReceived = vargani
    .filter(v => v.status === 'verified')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalPending = vargani
    .filter(v => v.status === 'pending')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalExpenses = expenses
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalDholMaintenance = dholMaintenance
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const netBalance = totalReceived - totalExpenses;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayReceived = vargani
    .filter(v => v.status === 'verified' && (v.createdAt || '').startsWith(todayStr))
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const todayExpenses = expenses
    .filter(e => (e.date || '').startsWith(todayStr))
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const stats = {
    totalReceived,
    totalPending,
    totalExpenses,
    totalDholMaintenance,
    netBalance,
    todayReceived,
    todayExpenses,
    donorCount: vargani.length,
    verifiedCount: vargani.filter(v => v.status === 'verified').length,
    pendingCount: vargani.filter(v => v.status === 'pending').length,
    expenseCount: expenses.length,
    targetGoal: config.targetGoal || 250000,
    progressPercent: Math.min(100, Math.round((totalReceived / (config.targetGoal || 250000)) * 100))
  };

  // Update Public Content
  const updatePublicContent = (newContent) => {
    setPublicContent(prev => ({ ...prev, ...newContent }));
  };

  // Mankari List Management
  const updateMankariList = (newList) => {
    setMankariList(newList);
  };

  const addMankari = (item) => {
    const newItem = {
      id: `mk-${Date.now()}`,
      day: item.day || 'Day 1',
      date: item.date || '07 Sept',
      family: item.family || 'नवीन परिवार',
      flat: item.flat || 'A-101',
      aarti: item.aarti || 'Evening'
    };
    setMankariList(prev => [newItem, ...prev]);
    return newItem;
  };

  const deleteMankari = (id) => {
    setMankariList(prev => prev.filter(m => m.id !== id));
  };

  // Cultural Events Day-Wise Management
  const updateCulturalEvent = (dayNum, updatedData) => {
    setCulturalEvents(prev =>
      prev.map(evt => {
        const evtDay = Number(evt.day);
        const targetDay = Number(dayNum);
        if (evtDay === targetDay || evt.id === updatedData?.id) {
          return { ...evt, ...updatedData, day: targetDay };
        }
        return evt;
      })
    );
  };

  const updateAllCulturalEvents = (newList) => {
    if (Array.isArray(newList) && newList.length > 0) {
      setCulturalEvents(newList);
    }
  };

  // Dhol Storage Assignments (Given to Storage)
  const addDholStorage = (item) => {
    const newItem = {
      id: `ds-${Date.now()}`,
      personName: item.personName || 'कार्यकर्ता',
      phone: item.phone || '',
      location: item.location || 'सोसायटी साठवणूक',
      dholCount: Number(item.dholCount) || 0,
      tashaCount: Number(item.tashaCount) || 0,
      status: item.status || 'In Storage',
      date: item.date || new Date().toISOString().slice(0, 10),
      notes: item.notes || ''
    };
    setDholStorage(prev => [newItem, ...prev]);
    return newItem;
  };

  const updateDholStorage = (id, updatedFields) => {
    setDholStorage(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              ...updatedFields,
              dholCount: updatedFields.dholCount !== undefined ? Number(updatedFields.dholCount) : item.dholCount,
              tashaCount: updatedFields.tashaCount !== undefined ? Number(updatedFields.tashaCount) : item.tashaCount
            }
          : item
      )
    );
  };

  const deleteDholStorage = (id) => {
    setDholStorage(prev => prev.filter(item => item.id !== id));
  };

  return (
    <MandalDataContext.Provider
      value={{
        config,
        vargani,
        expenses,
        tasks,
        dholInventory,
        dholMaintenance,
        dholStorage,
        schedule,
        publicContent,
        mankariList,
        culturalEvents,
        stats,
        isOnline,
        isConfigured,
        addVargani,
        updateVargani,
        deleteVargani,
        addExpense,
        deleteExpense,
        toggleTask,
        addTask,
        deleteTask,
        addDholMaintenance,
        updateDholInventory,
        addDholStorage,
        updateDholStorage,
        deleteDholStorage,
        updateMandalConfig,
        updatePublicContent,
        updateMankariList,
        addMankari,
        deleteMankari,
        updateCulturalEvent,
        updateAllCulturalEvents
      }}
    >
      {children}
    </MandalDataContext.Provider>
  );
}

export function useMandalData() {
  const context = useContext(MandalDataContext);
  if (!context) {
    throw new Error('useMandalData must be used within a MandalDataProvider');
  }
  return context;
}

