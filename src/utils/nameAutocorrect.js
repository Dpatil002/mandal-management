/**
 * Name Autocorrection & Suggestions Utility for Indrayani Vihar Mandal
 * Standardizes Marathi & English resident names, honorific titles (Kaku, Vahini),
 * and fixes common typos and transliteration differences.
 */

export const KNOWN_RESIDENTS_DIRECTORY = [
  // Musical Chair & Games Participants
  'Mote Kaku',
  'Deokar Kaku',
  'Bhor Kaku',
  'Navele Vahini',
  'Samudre Vahini',
  'Salunkhe Vahini',
  'Panjali',
  'Advika Salunkhe',
  'Advika',
  'Jui Bhor',
  'Vedika Salunkhe',
  'Vedika',
  'Tanvi Kate',
  'Anushka Kesarkar',
  'Om Kate',
  'Param Jadhav',
  'Param',
  'Shivansh',
  'Shivansh Khandve',
  'Vivan Singh',
  'Akshay Bhor',
  'Praveen Dhanwat',
  'Sushil Bhor',
  'Isha Khandve',
  'Isha',
  'Prisha Phatade',
  'Ira Walunj',
  'Ira',
  'Malhar',
  'Anvit Deokar',
  'Darsh Date',
  'Darsh',
  'Yugansh Khandve',
  'Krishna Yadav',
  'Varad Bhor',
  'Advik Khandve',
  'Vignesh Joshi',
  'Adesh Kesarkar',
  'Neel Bhor',
  'Yash Hallald',
  'Tanvi Kamra',
  'Rahi Walunj',
  'Rachana',
  'Mayank',
  'Parisha',
  'Purva',
  'Aaryan Chandra',
  'Vedant Awale',
  'Prathmesh Mote',

  // Organisers & Committee Members
  'Suraj Chikne',
  'Vijay Thube',
  'Digambar Patil',
  'Prem Karad',
  'Karan Talekar',
  'Rahul Walunj',
  'Baban Jadhav',
  'Sudam Bhor',
  'Subhash Patil',
  'Kesarkar',
  'Hinge',
  'Ghanwat'
];

// Common typo / phonetic alias mapping
export const PHONETIC_ALIASES = {
  'salunke': 'Salunkhe',
  'salunkey': 'Salunkhe',
  'salunkhe vahini': 'Salunkhe Vahini',
  'advika salunke': 'Advika Salunkhe',
  'vedika salunke': 'Vedika Salunkhe',
  'dhanvat': 'Dhanwat',
  'dhawat': 'Dhanwat',
  'pravin dhanwat': 'Praveen Dhanwat',
  'pravin dhanvat': 'Praveen Dhanwat',
  'praveen dhanvat': 'Praveen Dhanwat',
  'praveen dhawat': 'Praveen Dhanwat',
  'pravin dhawat': 'Praveen Dhanwat',
  'khandave': 'Khandve',
  'shivansh khandave': 'Shivansh Khandve',
  'isha khandave': 'Isha Khandve',
  'phatde': 'Phatade',
  'prisha phatde': 'Prisha Phatade',
  'prisha phatade': 'Prisha Phatade',
  'prisha fatade': 'Prisha Phatade',
  'valunj': 'Walunj',
  'ira valunj': 'Ira Walunj',
  'rahi valunj': 'Rahi Walunj',
  'anvid': 'Anvit',
  'anveet': 'Anvit',
  'anvid deokar': 'Anvit Deokar',
  'anvit deokar': 'Anvit Deokar',
  'malahar': 'Malhar',
  'vihan': 'Vivan Singh',
  'deokar kaku': 'Deokar Kaku',
  'mote kaku': 'Mote Kaku',
  'bhor kaku': 'Bhor Kaku',
  'navele vahini': 'Navele Vahini',
  'samudre vahini': 'Samudre Vahini',
  'navle vahini': 'Navele Vahini',
  'sushil bhor': 'Sushil Bhor',
  'akshay bhor': 'Akshay Bhor',
  'jui bhor': 'Jui Bhor',
  'om kate': 'Om Kate',
  'tanvi kate': 'Tanvi Kate',
  'anushka kesarkar': 'Anushka Kesarkar',
  'param jadhav': 'Param Jadhav',
  'darsh date': 'Darsh Date',
  'vignesh joshi': 'Vignesh Joshi',
  'yugansh khandve': 'Yugansh Khandve',
  'krishna yadav': 'Krishna Yadav',
  'varad bhor': 'Varad Bhor',
  'advik khandve': 'Advik Khandve',
  'adesh kesarkar': 'Adesh Kesarkar',
  'neel bhor': 'Neel Bhor',
  'yash hallald': 'Yash Hallald',
  'yash halald': 'Yash Hallald',
  'tanvi kamra': 'Tanvi Kamra',
  'aaryan chandra': 'Aaryan Chandra',
  'aryan chandra': 'Aaryan Chandra',
  'vedant awale': 'Vedant Awale',
  'prathmesh mote': 'Prathmesh Mote'
};

/**
 * Standardizes title casing for words, preserving honorifics (Kaku, Vahini, etc.)
 * @param {string} str 
 * @returns {string}
 */
export function titleCase(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (word.length === 0) return '';
      const lower = word.toLowerCase();
      if (lower === 'kaku') return 'Kaku';
      if (lower === 'vahini') return 'Vahini';
      if (lower === 'tai') return 'Tai';
      if (lower === 'dada') return 'Dada';
      if (lower === 'rao') return 'Rao';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Autocorrects a given participant or resident name
 * @param {string} input 
 * @returns {string}
 */
export function autocorrectName(input) {
  if (!input || typeof input !== 'string') return '';
  const raw = input.trim();
  if (!raw || raw === '—' || raw === '-') return raw === '—' || raw === '-' ? '' : '';

  const lower = raw.toLowerCase();

  // 1. Direct Alias Match
  if (PHONETIC_ALIASES[lower]) {
    return PHONETIC_ALIASES[lower];
  }

  // 2. Exact Case-Insensitive Directory Match
  const exactMatch = KNOWN_RESIDENTS_DIRECTORY.find(
    (name) => name.toLowerCase() === lower
  );
  if (exactMatch) {
    return exactMatch;
  }

  // 3. Partial alias token replacements (e.g., surname fix)
  let words = raw.split(/\s+/);
  words = words.map((w) => {
    const wLower = w.toLowerCase();
    if (PHONETIC_ALIASES[wLower]) return PHONETIC_ALIASES[wLower];
    return w;
  });

  return titleCase(words.join(' '));
}

/**
 * Returns matching name suggestions for autocomplete
 * @param {string} query 
 * @param {number} maxResults 
 * @returns {string[]}
 */
export function getNameSuggestions(query, maxResults = 5) {
  if (!query || typeof query !== 'string') return [];
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];

  return KNOWN_RESIDENTS_DIRECTORY.filter((name) =>
    name.toLowerCase().includes(q)
  ).slice(0, maxResults);
}
