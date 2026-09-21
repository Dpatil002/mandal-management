import * as pdfjsLib from 'pdfjs-dist';

// Use bundled worker or inline fallback
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

/**
 * Extract raw text lines from a PDF file using pdfjs-dist.
 * @param {File} file
 * @returns {Promise<string[]>}
 */
export async function extractTextFromPdf(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText.split('\n').map((l) => l.trim()).filter(Boolean);
  } catch (err) {
    console.warn('PDF parsing fallback error:', err);
    return [];
  }
}

/**
 * Parses extracted lines into day-wise Mankari items.
 * Handles formats like:
 * "Day 1: Kulkarni Family (B-402)"
 * "Day 4 • Kadam (A-102), Patil (B-304)"
 */
export function parseMankariSchedule(lines = []) {
  const result = [];
  let currentDay = 'Day 1';
  let currentDate = '14 Sep';

  const defaultDates = {
    '1': '14 Sep',
    '2': '15 Sep',
    '3': '16 Sep',
    '4': '17 Sep',
    '5': '18 Sep',
    '6': '19 Sep',
    '7': '20 Sep',
    '8': '21 Sep',
    '9': '22 Sep',
    '10': '23 Sep',
    '11': '25 Sep'
  };

  lines.forEach((line, idx) => {
    // Check if line specifies a Day or Date
    const dayMatch = line.match(/day\s*([0-9]{1,2})/i) || line.match(/दिवस\s*([0-9]{1,2})/i);
    if (dayMatch) {
      const num = dayMatch[1];
      currentDay = `Day ${num}`;
      currentDate = defaultDates[num] || `${num} Sep`;
    }

    const dateMatch = line.match(/([0-9]{1,2}\s*(?:Sept|Sep|Oct|ऑगस्ट|सप्टेंबर))/i);
    if (dateMatch) {
      currentDate = dateMatch[1];
    }

    // Extract names and flat numbers
    const parts = line.replace(/day\s*[0-9]{1,2}/gi, '').replace(/दिवस\s*[0-9]{1,2}/gi, '').split(/[,;•|\n]/);

    parts.forEach((part) => {
      const trimmed = part.trim();
      if (!trimmed || trimmed.length < 3 || /^(date|mankari|schedule|aarti|वेळापत्रक|मानकरी|नाव)/i.test(trimmed)) {
        return;
      }

      // Strip any flat/parenthesized info from family name
      let family = trimmed.replace(/\(.*?\)/g, '').trim();

      // Check for aarti type
      let aarti = 'Evening';
      if (/morning|सकाळ/i.test(trimmed)) {
        aarti = 'Morning';
      }

      if (family.length >= 2) {
        result.push({
          id: `mk-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          day: currentDay,
          date: currentDate,
          family: family.replace(/^[-:•\s]+/, '').trim(),
          aarti
        });
      }
    });
  });

  return result;
}

export const parseMankariListFromLines = parseMankariSchedule;

