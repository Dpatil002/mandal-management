import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, isConfigured } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { generateReceiptNumber } from '../utils/formatters';

const MandalDataContext = createContext();

const INITIAL_MANDAL_CONFIG = {
  name: 'इंद्रायणी विहार मित्र मंडळ',
  englishName: 'Indrayani Vihar Mitra Mandal',
  subtitle: 'सार्वजनिक गणेशोत्सव २०२६ • ३१ वर्षे पूर्ण (Est. 1995)',
  location: 'Indrayani Vihar, Lohegaon, Pune',
  year: 2026,
  establishedYear: 1995,
  yearsCompleted: 31,
  upiId: '9673909460@ybl',
  president: '',
  treasurer: '',
  targetGoal: 250000,
  driveUrl: 'https://drive.google.com/drive/folders/1rzx_qCusszWSmDoCKxi4mjw53ebjHPao?usp=sharing',
  qrCodeUrl: '/payment-qr.png',
  helplinePhone: ''
};

const INITIAL_PUBLIC_CONTENT = {
  morningAartiTime: '10:00 AM',
  morningAartiMarathiTime: 'सकाळी १०:००',
  morningAartiTitle: 'Morning Aarti (सकाळची आरती)',
  morningAartiNote: '',
  eveningAartiTime: '8:00 PM',
  eveningAartiMarathiTime: 'रात्री ८:००',
  eveningAartiTitle: 'Evening Maha Aarti (संध्याकाळची महाआरती)',
  eveningAartiNote: '',
  todayEventName: '',
  todayEventMarathiName: '',
  todayEventTime: '',
  todayEventLocation: '',
  todayEventDay: '',
  varganiMessage: 'सहकार्य आणि भक्तीभावाने उत्सव साजरा करूया.',
  announcementTitle: '',
  announcementSub: ''
};

const INITIAL_CULTURAL_EVENTS = [
  {
    id: 'ce-1',
    day: 1,
    dayLabel: 'Day 1 • 14 Sep • Mon (सोम.) • गणेश चतुर्थी',
    date: '14 Sep',
    title: 'Ganesh Stapan & Aarti',
    marathiTitle: 'श्री गणेश स्थापना व महाआरती',
    time: '06:00 PM',
    location: 'Main Stage (मुख्य मंडप)',
    performers: '',
    description: 'श्रींची प्राणप्रतिष्ठापना व सामूहिक आरती'
  },
  {
    id: 'ce-2',
    day: 2,
    dayLabel: 'Day 2 • 15 Sep • Tue (मंगळ.) • ऋषीपंचमी',
    date: '15 Sep',
    title: 'Cultural Program & Aarti',
    marathiTitle: 'सांस्कृतिक कार्यक्रम व आरती',
    time: '06:00 PM',
    location: 'Main Stage (मुख्य मंडप)',
    performers: '',
    description: 'सांस्कृतिक कार्यक्रम व महाआरती'
  },
  {
    id: 'ce-3',
    day: 3,
    dayLabel: 'Day 3 • 16 Sep • Wed (बुध.) • तृतीया',
    date: '16 Sep',
    title: 'Bhajan Sandhya & Aarti',
    marathiTitle: 'भजन संध्या व महाआरती',
    time: '06:30 PM',
    location: 'Main Stage (मुख्य मंडप)',
    performers: '',
    description: 'महिला भजन मंडळ व पारंपरिक भक्तीगीते'
  },
  {
    id: 'ce-4',
    day: 4,
    dayLabel: 'Day 4 • 17 Sep • Thu (गुरु.)',
    date: '17 Sep',
    title: 'Games',
    marathiTitle: '🎮 Games (खेळ व स्पर्धा)',
    time: '06:00 PM',
    location: 'Main Mandap & Ground',
    performers: '',
    description: 'विविध खेळ व मनोरंजक स्पर्धांचे आयोजन'
  },
  {
    id: 'ce-5',
    day: 5,
    dayLabel: 'Day 5 • 18 Sep • Fri (शुक्र.)',
    date: '18 Sep',
    title: 'Devotional Movie',
    marathiTitle: '🎬 धार्मिक Movie',
    time: '07:00 PM',
    location: 'Main Stage (मुख्य मंडप)',
    performers: '',
    description: 'धार्मिक चित्रपट प्रदर्शन'
  },
  {
    id: 'ce-6',
    day: 6,
    dayLabel: 'Day 6 • 19 Sep • Sat (शनि.)',
    date: '19 Sep',
    title: 'Dance & Fancy Dress Competition',
    marathiTitle: '💃 Dance & Fancy Dress Competition',
    time: '06:00 PM',
    location: 'Main Stage (मुख्य मंडप)',
    performers: '',
    description: 'नृत्य व फॅन्सी ड्रेस स्पर्धा'
  },
  {
    id: 'ce-7',
    day: 7,
    dayLabel: 'Day 7 • 20 Sep • Sun (रवि.)',
    date: '20 Sep',
    title: 'Home Minister',
    marathiTitle: '🎤 Home Minister',
    time: '06:30 PM',
    location: 'Main Stage (मुख्य मंडप)',
    performers: '',
    description: 'Home Minister (Anchor Available असल्यास)'
  },
  {
    id: 'ce-8',
    day: 8,
    dayLabel: 'Day 8 • 21 Sep • Mon (सोम.)',
    date: '21 Sep',
    title: 'Event will be announced soon',
    marathiTitle: '🔸 कार्यक्रम लवकरच कळवण्यात येईल',
    time: '06:00 PM',
    location: 'Main Stage (मुख्य मंडप)',
    performers: '',
    description: 'कार्यक्रमाची माहिती लवकरच प्रसिद्ध केली जाईल.'
  },
  {
    id: 'ce-9',
    day: 9,
    dayLabel: 'Day 9 • 22 Sep • Tue (मंगळ.)',
    date: '22 Sep',
    title: 'Event will be announced soon',
    marathiTitle: '🔸 कार्यक्रम लवकरच कळवण्यात येईल',
    time: '06:00 PM',
    location: 'Main Stage (मुख्य मंडप)',
    performers: '',
    description: 'कार्यक्रमाची माहिती लवकरच प्रसिद्ध केली जाईल.'
  },
  {
    id: 'ce-10',
    day: 10,
    dayLabel: 'Day 10 • 23 Sep • Wed (बुध.)',
    date: '23 Sep',
    title: 'Event will be announced soon',
    marathiTitle: '🔸 कार्यक्रम लवकरच कळवण्यात येईल',
    time: '06:00 PM',
    location: 'Main Stage (मुख्य मंडप)',
    performers: '',
    description: 'कार्यक्रमाची माहिती लवकरच प्रसिद्ध केली जाईल.'
  },
  {
    id: 'ce-11',
    day: 11,
    dayLabel: 'Day 11 • 24 Sep • Thu (गुरु.)',
    date: '24 Sep',
    title: 'Mangla Gauri',
    marathiTitle: '🌺 Mangla Gauri (मंगळागौरी)',
    time: '05:30 PM',
    location: 'Main Stage (मुख्य मंडप)',
    performers: '',
    description: 'मंगळागौरीचे पारंपरिक खेळ व पूजा'
  },
  {
    id: 'ce-12',
    day: 12,
    dayLabel: 'Day 12 • 25 Sep • Fri (शुक्र.) • अनंत चतुर्दशी',
    date: '25 Sep',
    title: 'Satyanarayan Pooja, Mahaprasad & Miravnuk / Visarjan',
    marathiTitle: '🙏 सत्यनारायण पूजा • 🍛 महाप्रसाद • 🪔 Miravnuk & Visarjan',
    time: '04:00 PM',
    location: 'Indrayani Vihar to Visarjan Ghat',
    performers: '',
    description: 'सत्यनारायण पूजा, महाप्रसाद आणि विसर्जन मिरवणूक'
  }
];

const INITIAL_MANKARI_LIST = [
  // Day 1 • 14 Sept • Mon (सोम.)
  { id: 'mk-1-1', day: 1, name: 'श्री. केसरकर' },
  { id: 'mk-1-2', day: 1, name: 'श्री. जाधव (बबन)' },
  { id: 'mk-1-3', day: 1, name: 'श्री. भोर (सुदाम)' },
  { id: 'mk-1-4', day: 1, name: 'श्री. पाटील (सुभाष)' },
  { id: 'mk-1-5', day: 1, name: 'श्री. ठुबे' },
  { id: 'mk-1-6', day: 1, name: 'श्री. घनवट' },
  { id: 'mk-1-7', day: 1, name: 'श्री. हिंगे' },

  // Day 2 • 15 Sept • Tue (मंगळ.)
  { id: 'mk-2-1', day: 2, name: 'श्री. कराड' },
  { id: 'mk-2-2', day: 2, name: 'श्री. वाबळे' },
  { id: 'mk-2-3', day: 2, name: 'श्री. उमाशंकर' },
  { id: 'mk-2-4', day: 2, name: 'श्री. चासकर' },
  { id: 'mk-2-5', day: 2, name: 'श्री. आवळे' },

  // Day 3 • 16 Sept • Wed (बुध.)
  { id: 'mk-3-1', day: 3, name: 'श्री. वानखेडे' },
  { id: 'mk-3-2', day: 3, name: 'श्री. जाधव (बळीराम)' },
  { id: 'mk-3-3', day: 3, name: 'श्री. पाटील (शहाजी)' },
  { id: 'mk-3-4', day: 3, name: 'श्री. पिसाळ' },
  { id: 'mk-3-5', day: 3, name: 'श्री. देव' },
  { id: 'mk-3-6', day: 3, name: 'श्री. देवकर' },
  { id: 'mk-3-7', day: 3, name: 'श्री. सिंग (एस. पी.)' },

  // Day 4 • 17 Sept • Thu (गुरु.)
  { id: 'mk-4-1', day: 4, name: 'श्री. गावडे' },
  { id: 'mk-4-2', day: 4, name: 'श्री. दुधाळे' },
  { id: 'mk-4-3', day: 4, name: 'श्री. माने (गुरुजी)' },
  { id: 'mk-4-4', day: 4, name: 'श्री. काळे' },
  { id: 'mk-4-5', day: 4, name: 'श्री. सिंग (आर.पी.)' },
  { id: 'mk-4-6', day: 4, name: 'श्री. तळेकर' },

  // Day 5 • 18 Sept • Fri (शुक्र.)
  { id: 'mk-5-1', day: 5, name: 'श्री. काटे' },
  { id: 'mk-5-2', day: 5, name: 'श्री. मोटे' },
  { id: 'mk-5-3', day: 5, name: 'श्री. घोडेकर' },
  { id: 'mk-5-4', day: 5, name: 'श्री. दाते' },
  { id: 'mk-5-5', day: 5, name: 'श्री. भोर (चंद्रकांत)' },
  { id: 'mk-5-6', day: 5, name: 'श्री. माने (सोपान)' },
  { id: 'mk-5-7', day: 5, name: 'श्री. साळुंखे' },

  // Day 6 • 19 Sept • Sat (शनि.)
  { id: 'mk-6-1', day: 6, name: 'श्री. पवार' },
  { id: 'mk-6-2', day: 6, name: 'श्री. रायकर' },
  { id: 'mk-6-3', day: 6, name: 'श्री. चिकणे' },
  { id: 'mk-6-4', day: 6, name: 'श्री. खांदवे (श्रीहरी)' },
  { id: 'mk-6-5', day: 6, name: 'श्री. लांडगे' },
  { id: 'mk-6-6', day: 6, name: 'श्री. बहिरट' },
  { id: 'mk-6-7', day: 6, name: 'श्री. पटाडे' },

  // Day 7 • 20 Sept • Sun (रवि.)
  { id: 'mk-7-1', day: 7, name: 'श्री. वाळुंज' },
  { id: 'mk-7-2', day: 7, name: 'श्री. नवले' },
  { id: 'mk-7-3', day: 7, name: 'श्री. कांबळे (अशोक)' },
  { id: 'mk-7-4', day: 7, name: 'श्री. नायर' },
  { id: 'mk-7-5', day: 7, name: 'श्री. हल्लाळे' },
  { id: 'mk-7-6', day: 7, name: 'श्री. प्रभुणे' },
  { id: 'mk-7-7', day: 7, name: 'श्री. राऊळ' },

  // Day 8 • 21 Sept • Mon (सोम.)
  { id: 'mk-8-1', day: 8, name: 'श्री. बागल' },
  { id: 'mk-8-2', day: 8, name: 'पाचपुते काकू' },
  { id: 'mk-8-3', day: 8, name: 'श्री. ढाणे संतोष' },
  { id: 'mk-8-4', day: 8, name: 'श्री. जाधव (सुरज)' },
  { id: 'mk-8-5', day: 8, name: 'श्री. खालकर' },
  { id: 'mk-8-6', day: 8, name: 'श्री. यादव' },
  { id: 'mk-8-7', day: 8, name: 'श्री. आवारी' },

  // Day 9 • 22 Sept • Tue (मंगळ.)
  { id: 'mk-9-1', day: 9, name: 'श्री. रोमण' },
  { id: 'mk-9-2', day: 9, name: 'श्री. कांबळे (एस. एल.)' },
  { id: 'mk-9-3', day: 9, name: 'श्री. गावडे (विकी)' },
  { id: 'mk-9-4', day: 9, name: 'श्री. मुंगसे' },
  { id: 'mk-9-5', day: 9, name: 'श्री. गोरे' },

  // Day 10 • 23 Sept • Wed (बुध.)
  { id: 'mk-10-1', day: 10, name: 'श्री. गायकवाड' },
  { id: 'mk-10-2', day: 10, name: 'श्री. वायदंडे' },
  { id: 'mk-10-3', day: 10, name: 'श्री. लवंगे' },
  { id: 'mk-10-4', day: 10, name: 'श्री. भोईटे' },
  { id: 'mk-10-5', day: 10, name: 'श्री. देसाई' },

  // Day 11 • 24 Sept • Thu (गुरु.)
  { id: 'mk-11-1', day: 11, name: 'मंडळातील सर्व युवा कार्यकर्ते' },

  // Day 12 • 25 Sept • Fri (शुक्र.)
  { id: 'mk-12-1', day: 12, name: 'महाप्रसाद व विसर्जन मिरवणूक' }
];

const INITIAL_VARGANI = [];

const INITIAL_EXPENSES = [];

const INITIAL_TASKS = [];

const INITIAL_DHOL_INVENTORY = {
  dhol: 0,
  tasha: 0,
  dhwaja: 0,
  tol: 0
};

const INITIAL_DHOL_MAINTENANCE = [];

const INITIAL_DHOL_STORAGE = [];

const INITIAL_GAME_WINNERS = [
  // 1. Musical Chair
  {
    id: 'gw-mc-kaku',
    gameName: 'Musical Chair',
    category: 'Kaku',
    first: 'Mote Kaku',
    second: 'Deokar Kaku',
    third: 'Bhor Kaku',
    createdAt: '2026-09-17T00:00:00.000Z'
  },
  {
    id: 'gw-mc-vahini',
    gameName: 'Musical Chair',
    category: 'Vahini',
    first: 'Navele Vahini',
    second: 'Samudre Vahini',
    third: 'Salunkhe Vahini',
    createdAt: '2026-09-17T00:01:00.000Z'
  },
  {
    id: 'gw-mc-girlskids',
    gameName: 'Musical Chair',
    category: 'Girls (Kids)',
    first: 'Panjali',
    second: 'Advika Salunkhe',
    third: 'Jui Bhor',
    createdAt: '2026-09-17T00:02:00.000Z'
  },
  {
    id: 'gw-mc-girls',
    gameName: 'Musical Chair',
    category: 'Girls',
    first: 'Vedika Salunkhe',
    second: 'Tanvi Kate',
    third: 'Anushka Kesarkar',
    createdAt: '2026-09-17T00:03:00.000Z'
  },
  {
    id: 'gw-mc-boys',
    gameName: 'Musical Chair',
    category: 'Boys',
    first: 'Shivansh',
    second: 'Param Jadhav',
    third: 'Om Kate',
    createdAt: '2026-09-17T00:04:00.000Z'
  },
  {
    id: 'gw-mc-boys2',
    gameName: 'Musical Chair',
    category: 'Boys (Group 2)',
    first: '',
    second: '',
    third: 'Vivan Singh',
    createdAt: '2026-09-17T00:05:00.000Z'
  },
  {
    id: 'gw-mc-mens',
    gameName: 'Musical Chair',
    category: 'Mens',
    first: 'Akshay Bhor',
    second: 'Praveen Dhanwat',
    third: 'Sushil Bhor',
    createdAt: '2026-09-17T00:06:00.000Z'
  },

  // 2. Slow Cycling
  {
    id: 'gw-sc-boys',
    gameName: 'Slow Cycling',
    category: 'Boys',
    first: 'Shivansh Khandve',
    second: '',
    third: '',
    createdAt: '2026-09-17T00:07:00.000Z'
  },
  {
    id: 'gw-sc-girls',
    gameName: 'Slow Cycling',
    category: 'Girls',
    first: 'Isha Khandve',
    second: '',
    third: '',
    createdAt: '2026-09-17T00:08:00.000Z'
  },

  // 3. Chamcha Limbu
  {
    id: 'gw-cl-girls',
    gameName: 'Chamcha Limbu',
    category: 'Girls',
    first: 'Panjali',
    second: 'Prisha Phatade',
    third: 'Ira Walunj',
    createdAt: '2026-09-17T00:09:00.000Z'
  },
  {
    id: 'gw-cl-boys',
    gameName: 'Chamcha Limbu',
    category: 'Boys',
    first: 'Malhar',
    second: 'Param Jadhav',
    third: 'Anvit Deokar',
    createdAt: '2026-09-17T00:10:00.000Z'
  },
  {
    id: 'gw-cl-boys-girls',
    gameName: 'Chamcha Limbu',
    category: 'Boys & Girls',
    first: 'Darsh Date',
    second: 'Isha Khandve',
    third: 'Vedika Salunkhe',
    createdAt: '2026-09-17T00:11:00.000Z'
  },

  // 4. Plate Game
  {
    id: 'gw-pg-girls',
    gameName: 'Plate Game',
    category: 'Girls',
    first: 'Ira Walunj',
    second: 'Jui Bhor',
    third: 'Prisha Phatade',
    createdAt: '2026-09-17T00:12:00.000Z'
  },
  {
    id: 'gw-pg-boys-till4th',
    gameName: 'Plate Game',
    category: 'Boys (Till 4th)',
    first: 'Yugansh Khandve',
    second: 'Krishna Yadav',
    third: 'Varad Bhor',
    createdAt: '2026-09-17T00:13:00.000Z'
  },
  {
    id: 'gw-pg-boys-group2',
    gameName: 'Plate Game',
    category: 'Boys (Group 2)',
    first: 'Om Kate',
    second: 'Anvit Deokar',
    third: 'Advik Khandve',
    createdAt: '2026-09-17T00:14:00.000Z'
  },
  {
    id: 'gw-pg-kids',
    gameName: 'Plate Game',
    category: 'Kids',
    first: 'Vignesh Joshi',
    second: 'Adesh Kesarkar',
    third: 'Neel Bhor',
    createdAt: '2026-09-17T00:15:00.000Z'
  },
  {
    id: 'gw-pg-boys-group3',
    gameName: 'Plate Game',
    category: 'Boys (Group 3)',
    first: 'Shivansh Khandve',
    second: 'Yash Hallald',
    third: 'Vivan Singh',
    createdAt: '2026-09-17T00:16:00.000Z'
  },
  {
    id: 'gw-pg-girls-group2',
    gameName: 'Plate Game',
    category: 'Girls (Group 2)',
    first: 'Tanvi Kamra',
    second: 'Rahi Walunj',
    third: '',
    createdAt: '2026-09-17T00:17:00.000Z'
  },

  // 5. Jump Game
  {
    id: 'gw-jg-girls',
    gameName: 'Jump Game',
    category: 'Girls',
    first: 'Ira',
    second: 'Rachana',
    third: 'Advika',
    createdAt: '2026-09-17T00:18:00.000Z'
  },
  {
    id: 'gw-jg-boys',
    gameName: 'Jump Game',
    category: 'Boys',
    first: 'Anvit Deokar',
    second: 'Param',
    third: 'Mayank',
    createdAt: '2026-09-17T00:19:00.000Z'
  },
  {
    id: 'gw-jg-girls-group2',
    gameName: 'Jump Game',
    category: 'Girls (Group 2)',
    first: 'Parisha',
    second: 'Panjali',
    third: 'Purva',
    createdAt: '2026-09-17T00:20:00.000Z'
  },

  // 6. Balloon Competition
  {
    id: 'gw-bc-girls',
    gameName: 'Balloon Competition',
    category: 'Girls',
    first: 'Vedika',
    second: '',
    third: '',
    createdAt: '2026-09-17T00:21:00.000Z'
  },
  {
    id: 'gw-bc-boys',
    gameName: 'Balloon Competition',
    category: 'Boys',
    first: 'Aaryan Chandra',
    second: '',
    third: '',
    createdAt: '2026-09-17T00:22:00.000Z'
  },
  {
    id: 'gw-bc-boys-group2',
    gameName: 'Balloon Competition',
    category: 'Boys (Group 2)',
    first: 'Vedant Awale',
    second: 'Prathmesh Mote',
    third: '',
    createdAt: '2026-09-17T00:23:00.000Z'
  }
];

const INITIAL_SCHEDULE = [];

import { useAuth } from './AuthContext';
import { logSecurityEvent } from '../utils/securityLogger';

export function MandalDataProvider({ children }) {
  const { isAuthenticated } = useAuth();

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
    if (!isAuthenticated) return INITIAL_VARGANI;
    try {
      const saved = localStorage.getItem('iv_mandal_vargani');
      return saved ? JSON.parse(saved) : INITIAL_VARGANI;
    } catch {
      return INITIAL_VARGANI;
    }
  });

  const [expenses, setExpenses] = useState(() => {
    if (!isAuthenticated) return INITIAL_EXPENSES;
    try {
      const saved = localStorage.getItem('iv_mandal_expenses');
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [tasks, setTasks] = useState(() => {
    if (!isAuthenticated) return INITIAL_TASKS;
    try {
      const saved = localStorage.getItem('iv_mandal_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [dholInventory, setDholInventory] = useState(() => {
    if (!isAuthenticated) return INITIAL_DHOL_INVENTORY;
    try {
      const saved = localStorage.getItem('iv_dhol_inventory');
      return saved ? JSON.parse(saved) : INITIAL_DHOL_INVENTORY;
    } catch {
      return INITIAL_DHOL_INVENTORY;
    }
  });

  const [dholMaintenance, setDholMaintenance] = useState(() => {
    if (!isAuthenticated) return INITIAL_DHOL_MAINTENANCE;
    try {
      const saved = localStorage.getItem('iv_dhol_maintenance');
      return saved ? JSON.parse(saved) : INITIAL_DHOL_MAINTENANCE;
    } catch {
      return INITIAL_DHOL_MAINTENANCE;
    }
  });

  const [dholStorage, setDholStorage] = useState(() => {
    if (!isAuthenticated) return INITIAL_DHOL_STORAGE;
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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_MANKARI_LIST;
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

  const [gameWinners, setGameWinners] = useState(() => {
    try {
      const saved = localStorage.getItem('iv_game_winners');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_GAME_WINNERS;
    } catch {
      return INITIAL_GAME_WINNERS;
    }
  });

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Sync public config & schedules to localStorage
  useEffect(() => {
    localStorage.setItem('iv_mandal_config', JSON.stringify(config));
  }, [config]);

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

  useEffect(() => {
    localStorage.setItem('iv_game_winners', JSON.stringify(gameWinners));
  }, [gameWinners]);

  // Sync private organiser-only data ONLY when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('iv_mandal_vargani', JSON.stringify(vargani));
      localStorage.setItem('iv_mandal_expenses', JSON.stringify(expenses));
      localStorage.setItem('iv_mandal_tasks', JSON.stringify(tasks));
      localStorage.setItem('iv_dhol_inventory', JSON.stringify(dholInventory));
      localStorage.setItem('iv_dhol_maintenance', JSON.stringify(dholMaintenance));
      localStorage.setItem('iv_dhol_storage', JSON.stringify(dholStorage));
    }
  }, [isAuthenticated, vargani, expenses, tasks, dholInventory, dholMaintenance, dholStorage]);

  // Clean up private state on logout only
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem('iv_mandal_vargani');
      localStorage.removeItem('iv_mandal_expenses');
      localStorage.removeItem('iv_mandal_tasks');
      localStorage.removeItem('iv_dhol_inventory');
      localStorage.removeItem('iv_dhol_maintenance');
      localStorage.removeItem('iv_dhol_storage');
      setVargani([]);
      setExpenses([]);
      setTasks([]);
      setDholInventory(INITIAL_DHOL_INVENTORY);
      setDholMaintenance([]);
      setDholStorage([]);
    }
  }, [isAuthenticated]);

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

  // 1. Public Content Live Subscriptions (Open to both public & organisers)
  useEffect(() => {
    if (!isConfigured || !db) return;

    try {
      // Mandal Config
      const unsubConfig = onSnapshot(doc(db, 'mandalConfig', 'main'), (snapshot) => {
        if (snapshot.exists()) {
          setConfig(prev => ({ ...INITIAL_MANDAL_CONFIG, ...snapshot.data() }));
        } else {
          setDoc(doc(db, 'mandalConfig', 'main'), INITIAL_MANDAL_CONFIG, { merge: true }).catch(() => {});
        }
      }, (err) => console.warn('Firestore Config listener:', err));

      // Public Content (Aarti times, announcements, banners)
      const unsubPublicContent = onSnapshot(doc(db, 'publicContent', 'main'), (snapshot) => {
        if (snapshot.exists()) {
          setPublicContent(prev => ({ ...INITIAL_PUBLIC_CONTENT, ...snapshot.data() }));
        } else {
          setDoc(doc(db, 'publicContent', 'main'), INITIAL_PUBLIC_CONTENT, { merge: true }).catch(() => {});
        }
      }, (err) => console.warn('Firestore PublicContent listener:', err));

      // Cultural Events (Day 1-12 Performances)
      const unsubCultural = onSnapshot(doc(db, 'culturalEvents', 'main'), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const list = data?.events || data?.list;
          if (Array.isArray(list) && list.length > 0) {
            setCulturalEvents(list);
            localStorage.setItem('iv_cultural_events', JSON.stringify(list));
            return;
          }
        }
        setDoc(doc(db, 'culturalEvents', 'main'), { events: INITIAL_CULTURAL_EVENTS, list: INITIAL_CULTURAL_EVENTS }, { merge: true }).catch(() => {});
        setCulturalEvents(INITIAL_CULTURAL_EVENTS);
      }, (err) => console.warn('Firestore CulturalEvents listener:', err));

      // Mankari List
      const unsubMankari = onSnapshot(doc(db, 'mankariList', 'main'), (snapshot) => {
        if (snapshot.exists()) {
          const list = snapshot.data()?.list;
          if (Array.isArray(list) && list.length > 0) {
            setMankariList(list);
            localStorage.setItem('iv_mankari_list', JSON.stringify(list));
            return;
          }
        }
        setDoc(doc(db, 'mankariList', 'main'), { list: INITIAL_MANKARI_LIST }, { merge: true }).catch(() => {});
        setMankariList(INITIAL_MANKARI_LIST);
      }, (err) => console.warn('Firestore MankariList listener:', err));

      // Schedule
      const unsubSchedule = onSnapshot(doc(db, 'schedule', 'main'), (snapshot) => {
        if (snapshot.exists() && Array.isArray(snapshot.data()?.list)) {
          setSchedule(snapshot.data().list);
        } else {
          setDoc(doc(db, 'schedule', 'main'), { list: INITIAL_SCHEDULE }, { merge: true }).catch(() => {});
        }
      }, (err) => console.warn('Firestore Schedule listener:', err));

      // Game Winners List
      const unsubWinners = onSnapshot(doc(db, 'gameWinners', 'main'), (snapshot) => {
        if (snapshot.exists()) {
          const list = snapshot.data()?.list || snapshot.data()?.winners || snapshot.data()?.items;
          if (Array.isArray(list) && list.length > 0) {
            setGameWinners(list);
            localStorage.setItem('iv_game_winners', JSON.stringify(list));
            return;
          }
        }
        setDoc(doc(db, 'gameWinners', 'main'), { list: INITIAL_GAME_WINNERS }, { merge: true }).catch(() => {});
        setGameWinners(INITIAL_GAME_WINNERS);
        localStorage.setItem('iv_game_winners', JSON.stringify(INITIAL_GAME_WINNERS));
      }, (err) => console.warn('Firestore GameWinners listener:', err));

      return () => {
        unsubConfig();
        unsubPublicContent();
        unsubCultural();
        unsubMankari();
        unsubSchedule();
        unsubWinners();
      };
    } catch (e) {
      console.warn('Firestore public subscription fallback:', e);
    }
  }, []);

  // 2. Private Organiser-Only Live Subscriptions (Active ONLY when isAuthenticated === true)
  useEffect(() => {
    if (!isAuthenticated || !isConfigured || !db) return;

    try {
      // Vargani Collection (Organiser View)
      const unsubVargani = onSnapshot(collection(db, 'vargani'), (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const seen = new Set();
        const deduplicated = list.filter(item => {
          if (!item?.id) return true;
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        setVargani(deduplicated);
      }, (err) => {
        console.warn('Firestore Vargani listener error:', err);
        logSecurityEvent({
          type: 'FIRESTORE_PERMISSION_DENIED',
          severity: 'WARN',
          message: `Firestore vargani subscription error: ${err?.code || err?.message}`,
          details: { errorCode: err?.code }
        });
      });

      // Expenses Collection (Organiser View)
      const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const seen = new Set();
        const deduplicated = list.filter(item => {
          if (!item?.id) return true;
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        setExpenses(deduplicated);
      }, (err) => {
        console.warn('Firestore Expenses listener error:', err);
        logSecurityEvent({
          type: 'FIRESTORE_PERMISSION_DENIED',
          severity: 'WARN',
          message: `Firestore expenses subscription error: ${err?.code || err?.message}`,
          details: { errorCode: err?.code }
        });
      });

      // Tasks Collection (Organiser View)
      const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const seen = new Set();
        const deduplicated = list.filter(item => {
          if (!item?.id) return true;
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        setTasks(deduplicated);
      }, (err) => {
        console.warn('Firestore Tasks listener error:', err);
        logSecurityEvent({
          type: 'FIRESTORE_PERMISSION_DENIED',
          severity: 'WARN',
          message: `Firestore tasks subscription error: ${err?.code || err?.message}`,
          details: { errorCode: err?.code }
        });
      });

      // Dhol Storage Collection (Organiser View)
      const unsubDholStorage = onSnapshot(collection(db, 'dholStorage'), (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const seen = new Set();
        const deduplicated = list.filter(item => {
          if (!item?.id) return true;
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        setDholStorage(deduplicated);
      }, (err) => console.warn('Firestore DholStorage listener error:', err));

      // Dhol Maintenance Collection (Organiser View)
      const unsubDholMaint = onSnapshot(collection(db, 'dholMaintenance'), (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const seen = new Set();
        const deduplicated = list.filter(item => {
          if (!item?.id) return true;
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        setDholMaintenance(deduplicated);
      }, (err) => console.warn('Firestore DholMaintenance listener error:', err));

      return () => {
        unsubVargani();
        unsubExpenses();
        unsubTasks();
        unsubDholStorage();
        unsubDholMaint();
      };
    } catch (e) {
      console.warn('Firestore organiser subscription fallback:', e);
    }
  }, [isAuthenticated]);

  // Add Vargani (Public Write or Organiser Manual Add)
  const addVargani = async (data) => {
    const nextReceiptNo = generateReceiptNumber(
      (vargani?.length || Math.floor(Math.random() * 8000) + 1000) + 1,
      config.year
    );
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
        if (isAuthenticated) {
          setVargani(prev => prev.some(x => x.id === newEntry.id) ? prev : [newEntry, ...prev]);
        }
      }
    } else {
      newEntry.id = `v-${Date.now()}`;
      if (isAuthenticated) {
        setVargani(prev => prev.some(x => x.id === newEntry.id) ? prev : [newEntry, ...prev]);
      }
    }

    return newEntry;
  };

  // Update Vargani (e.g. Verify / Edit / Unverify)
  const updateVargani = async (id, updatedData) => {
    const enrichedData = {
      ...updatedData,
      lastEditedAt: new Date().toISOString()
    };

    setVargani(prev =>
      prev.map(item => (item.id === id ? { ...item, ...enrichedData } : item))
    );

    if (isConfigured && db) {
      try {
        const currentItem = vargani.find(v => v.id === id) || {};
        await setDoc(doc(db, 'vargani', id), { ...currentItem, ...enrichedData }, { merge: true });
      } catch (e) {
        console.warn('Firestore updateVargani setDoc error:', e);
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
        setExpenses(prev => prev.some(x => x.id === newEntry.id) ? prev : [newEntry, ...prev]);
      }
    } else {
      newEntry.id = `e-${Date.now()}`;
      setExpenses(prev => prev.some(x => x.id === newEntry.id) ? prev : [newEntry, ...prev]);
    }

    return newEntry;
  };

  // Update Expense (Edit Existing Expense)
  const updateExpense = async (id, updatedData) => {
    const enrichedData = {
      ...updatedData,
      amount: updatedData.amount !== undefined ? Number(updatedData.amount) : undefined,
      lastEditedAt: new Date().toISOString()
    };

    setExpenses(prev =>
      prev.map(item => (item.id === id ? { ...item, ...enrichedData } : item))
    );

    if (isConfigured && db) {
      try {
        const currentItem = expenses.find(e => e.id === id) || {};
        await setDoc(doc(db, 'expenses', id), { ...currentItem, ...enrichedData }, { merge: true });
      } catch (e) {
        console.warn('Firestore updateExpense setDoc error:', e);
      }
    }
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
  const toggleTask = async (id) => {
    const targetTask = tasks.find(t => t.id === id);
    const updatedStatus = targetTask && targetTask.status === 'done' ? 'todo' : 'done';
    
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          return { ...t, status: updatedStatus };
        }
        return t;
      })
    );

    if (isConfigured && db) {
      try {
        const updatedTaskObj = { ...(targetTask || {}), status: updatedStatus };
        await setDoc(doc(db, 'tasks', id), updatedTaskObj, { merge: true });
      } catch (e) {
        console.warn('Firestore task setDoc error:', e);
      }
    }
  };

  const addTask = async (task) => {
    const newTask = { ...task, createdAt: new Date().toISOString(), status: 'todo' };
    if (isConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'tasks'), newTask);
        newTask.id = docRef.id;
      } catch (e) {
        newTask.id = `t-${Date.now()}`;
        setTasks(prev => prev.some(x => x.id === newTask.id) ? prev : [newTask, ...prev]);
      }
    } else {
      newTask.id = `t-${Date.now()}`;
      setTasks(prev => prev.some(x => x.id === newTask.id) ? prev : [newTask, ...prev]);
    }
    return newTask;
  };

  const deleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (isConfigured && db) {
      try {
        await deleteDoc(doc(db, 'tasks', id));
      } catch (e) {
        console.warn('Firestore task deleteDoc error:', e);
      }
    }
  };

  // Add Dhol Maintenance
  const addDholMaintenance = async (entry) => {
    const newEntry = {
      ...entry,
      date: entry.date || new Date().toISOString(),
      amount: Number(entry.amount) || 0
    };
    if (isConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'dholMaintenance'), newEntry);
        newEntry.id = docRef.id;
      } catch (e) {
        newEntry.id = `dm-${Date.now()}`;
        setDholMaintenance(prev => prev.some(x => x.id === newEntry.id) ? prev : [newEntry, ...prev]);
      }
    } else {
      newEntry.id = `dm-${Date.now()}`;
      setDholMaintenance(prev => prev.some(x => x.id === newEntry.id) ? prev : [newEntry, ...prev]);
    }
    return newEntry;
  };

  const updateDholInventory = (newCounts) => {
    setDholInventory(prev => ({ ...prev, ...newCounts }));
  };

  // Update Config (Synced live to Firestore doc mandalConfig/main)
  const updateMandalConfig = async (newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'mandalConfig', 'main'), newConfig, { merge: true });
      } catch (e) {
        console.warn('Firestore updateMandalConfig error:', e);
      }
    }
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

  // Update Public Content (Synced live to Firestore doc publicContent/main)
  const updatePublicContent = async (newContent) => {
    setPublicContent(prev => ({ ...prev, ...newContent }));
    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'publicContent', 'main'), newContent, { merge: true });
      } catch (e) {
        console.warn('Firestore updatePublicContent error:', e);
      }
    }
  };

  // Mankari List Management (Synced live to Firestore doc mankariList/main)
  const updateMankariList = async (newList) => {
    setMankariList(newList);
    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'mankariList', 'main'), { list: newList }, { merge: true });
      } catch (e) {
        console.warn('Firestore updateMankariList error:', e);
      }
    }
  };

  const addMankari = async (item) => {
    const newItem = {
      id: `mk-${Date.now()}`,
      day: item.day || 'Day 1',
      date: item.date || '07 Sept',
      family: item.family || 'नवीन परिवार',
      aarti: item.aarti || 'Evening'
    };
    const updated = [newItem, ...mankariList];
    setMankariList(updated);
    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'mankariList', 'main'), { list: updated }, { merge: true });
      } catch (e) {
        console.warn('Firestore addMankari error:', e);
      }
    }
    return newItem;
  };

  const deleteMankari = async (id) => {
    const updated = mankariList.filter(m => m.id !== id);
    setMankariList(updated);
    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'mankariList', 'main'), { list: updated }, { merge: true });
      } catch (e) {
        console.warn('Firestore deleteMankari error:', e);
      }
    }
  };

  // Cultural Events Day-Wise Management (Synced live to Firestore doc culturalEvents/main)
  const updateCulturalEvent = async (dayNum, updatedData) => {
    const targetDay = Number(dayNum);
    const existingList = Array.isArray(culturalEvents) && culturalEvents.length > 0 
      ? [...culturalEvents] 
      : [...INITIAL_CULTURAL_EVENTS];

    let found = false;
    const updatedList = existingList.map(evt => {
      const evtDay = Number(evt.day);
      if (evtDay === targetDay || evt.id === updatedData?.id || evt.id === `ce-${targetDay}`) {
        found = true;
        return { ...evt, ...updatedData, day: targetDay, id: evt.id || `ce-${targetDay}` };
      }
      return evt;
    });

    if (!found && updatedData) {
      updatedList.push({
        id: updatedData.id || `ce-${targetDay}`,
        day: targetDay,
        ...updatedData
      });
    }

    updatedList.sort((a, b) => Number(a.day) - Number(b.day));

    setCulturalEvents(updatedList);
    localStorage.setItem('iv_cultural_events', JSON.stringify(updatedList));

    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'culturalEvents', 'main'), { events: updatedList, list: updatedList }, { merge: true });
      } catch (e) {
        console.warn('Firestore updateCulturalEvent error:', e);
      }
    }
  };

  const updateAllCulturalEvents = async (newList) => {
    if (Array.isArray(newList) && newList.length > 0) {
      setCulturalEvents(newList);
      localStorage.setItem('iv_cultural_events', JSON.stringify(newList));
      if (isConfigured && db) {
        try {
          await setDoc(doc(db, 'culturalEvents', 'main'), { events: newList, list: newList }, { merge: true });
        } catch (e) {
          console.warn('Firestore updateAllCulturalEvents error:', e);
        }
      }
    }
  };

  // Dhol Storage Assignments (Given to Storage)
  const addDholStorage = async (item) => {
    const newItem = {
      personName: item.personName || 'कार्यकर्ता',
      phone: item.phone || '',
      location: item.location || 'सोसायटी साठवणूक',
      dholCount: Number(item.dholCount) || 0,
      tashaCount: Number(item.tashaCount) || 0,
      status: item.status || 'In Storage',
      date: item.date || new Date().toISOString().slice(0, 10),
      notes: item.notes || ''
    };
    if (isConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'dholStorage'), newItem);
        newItem.id = docRef.id;
      } catch (e) {
        newItem.id = `ds-${Date.now()}`;
      }
    } else {
      newItem.id = `ds-${Date.now()}`;
    }
    setDholStorage(prev => [newItem, ...prev]);
    return newItem;
  };

  const updateDholStorage = async (id, updatedFields) => {
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
    if (isConfigured && db) {
      try {
        const currentItem = dholStorage.find(ds => ds.id === id) || {};
        await setDoc(doc(db, 'dholStorage', id), { ...currentItem, ...updatedFields }, { merge: true });
      } catch (e) {
        console.warn('Firestore updateDholStorage error:', e);
      }
    }
  };
  const deleteDholStorage = async (id) => {
    setDholStorage(prev => prev.filter(item => item.id !== id));
    if (isConfigured && db) {
      try {
        await deleteDoc(doc(db, 'dholStorage', id));
      } catch (e) {
        console.warn('Firestore deleteDholStorage error:', e);
      }
    }
  };

  // Game Winners Management
  const addGameWinner = async (item) => {
    const newItem = {
      id: item.id || `gw-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      gameName: item.gameName?.trim() || 'Competition',
      category: item.category?.trim() || 'General',
      first: item.first !== undefined ? (item.first?.trim() || '') : (item.girls?.first?.trim() || item.boys?.first?.trim() || ''),
      second: item.second !== undefined ? (item.second?.trim() || '') : (item.girls?.second?.trim() || item.boys?.second?.trim() || ''),
      third: item.third !== undefined ? (item.third?.trim() || '') : (item.girls?.third?.trim() || item.boys?.third?.trim() || ''),
      isHidden: item.isHidden === true,
      createdAt: item.createdAt || new Date().toISOString()
    };
    if (item.girls) newItem.girls = item.girls;
    if (item.boys) newItem.boys = item.boys;

    const updated = [newItem, ...gameWinners];
    const sanitized = JSON.parse(JSON.stringify(updated));
    setGameWinners(sanitized);
    localStorage.setItem('iv_game_winners', JSON.stringify(sanitized));
    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'gameWinners', 'main'), { list: sanitized }, { merge: true });
      } catch (e) {
        console.warn('Firestore addGameWinner error:', e);
      }
    }
    return newItem;
  };

  const updateGameWinner = async (id, updatedFields) => {
    const updated = gameWinners.map(item => {
      if (item.id === id) {
        const merged = { ...item, ...updatedFields };
        if (updatedFields.first !== undefined) merged.first = updatedFields.first?.trim() || '';
        if (updatedFields.second !== undefined) merged.second = updatedFields.second?.trim() || '';
        if (updatedFields.third !== undefined) merged.third = updatedFields.third?.trim() || '';
        if (updatedFields.isHidden !== undefined) merged.isHidden = updatedFields.isHidden === true;
        return merged;
      }
      return item;
    });
    const sanitized = JSON.parse(JSON.stringify(updated));
    setGameWinners(sanitized);
    localStorage.setItem('iv_game_winners', JSON.stringify(sanitized));
    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'gameWinners', 'main'), { list: sanitized }, { merge: true });
      } catch (e) {
        console.warn('Firestore updateGameWinner error:', e);
      }
    }
  };

  const toggleGameWinnerVisibility = async (id) => {
    const target = gameWinners.find(item => item.id === id);
    if (!target) return;
    const newIsHidden = !target.isHidden;
    await updateGameWinner(id, { isHidden: newIsHidden });
    return newIsHidden;
  };

  const toggleGameGroupVisibility = async (gameName, setHidden) => {
    const updated = gameWinners.map(item => {
      if ((item.gameName || '').trim().toLowerCase() === (gameName || '').trim().toLowerCase()) {
        return {
          ...item,
          isHidden: setHidden !== undefined ? setHidden : !item.isHidden
        };
      }
      return item;
    });
    const sanitized = JSON.parse(JSON.stringify(updated));
    setGameWinners(sanitized);
    localStorage.setItem('iv_game_winners', JSON.stringify(sanitized));
    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'gameWinners', 'main'), { list: sanitized }, { merge: true });
      } catch (e) {
        console.warn('Firestore toggleGameGroupVisibility error:', e);
      }
    }
  };

  const deleteGameWinner = async (id) => {
    const updated = gameWinners.filter(item => item.id !== id);
    const sanitized = JSON.parse(JSON.stringify(updated));
    setGameWinners(sanitized);
    localStorage.setItem('iv_game_winners', JSON.stringify(sanitized));
    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'gameWinners', 'main'), { list: sanitized }, { merge: true });
      } catch (e) {
        console.warn('Firestore deleteGameWinner error:', e);
      }
    }
  };

  const updateAllGameWinners = async (newList) => {
    if (Array.isArray(newList)) {
      const sanitized = JSON.parse(JSON.stringify(newList));
      setGameWinners(sanitized);
      localStorage.setItem('iv_game_winners', JSON.stringify(sanitized));
      if (isConfigured && db) {
        try {
          await setDoc(doc(db, 'gameWinners', 'main'), { list: sanitized }, { merge: true });
        } catch (e) {
          console.warn('Firestore updateAllGameWinners error:', e);
        }
      }
    }
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
        gameWinners,
        stats,
        isOnline,
        isConfigured,
        addVargani,
        updateVargani,
        deleteVargani,
        addExpense,
        updateExpense,
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
        updateAllCulturalEvents,
        addGameWinner,
        updateGameWinner,
        toggleGameWinnerVisibility,
        toggleGameGroupVisibility,
        deleteGameWinner,
        updateAllGameWinners
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

