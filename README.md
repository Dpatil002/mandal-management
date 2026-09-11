# 🚩 Indrayani Vihar Mitra Mandal — Management PWA
> **सार्वजनिक गणेशोत्सव २०२६ • ३२ वे वर्ष**  
> Indrayani Vihar, Lohegaon, Pune

A modern, mobile-first Progressive Web Application (PWA) designed for seamless Mandal management, public festival engagement, donor contributions (Vargani), Aarti & Mankari schedules, cultural event listings, expense tracking, and instant automated PDF receipts.

---

## 🌟 Key Features

### 🏛️ Public View
- **Centered Mandal Branding**: Clean, focused header showcasing Indrayani Vihar Mitra Mandal's identity.
- **Pay Vargani / Contribution**: Instant UPI payment with dynamic client-side QR generation (`QRCodeSVG`), deep-links for Google Pay, PhonePe, and BHIM UPI, plus instant receipt generation.
- **Festival Schedule (10 Days)**:
  - Daily Morning Rituals & Evening Maha Aarti timings.
  - Day-wise Mankari family lists with flat details.
  - Day-wise Cultural Performance schedule & details.
- **Photos & Videos**: Direct integration for festival media sharing.
- **Mandal Tab Navigation**: Discreet access point for Organiser Login from the bottom navigation.

### 👥 Organiser Portal
- **Dashboard & Financial Overview**: Real-time summary of collections, expenses, remaining balance, and total contributors.
- **Vargani Management**: Quick collection recording (Cash/UPI), donor search, receipt download, and WhatsApp sharing.
- **Day-Wise Cultural Events Editor**: Organisers can edit, update, or add cultural performances and programs for each of the 10 festival days.
- **Organisers Directory**: Management of committee members (Name, Phone Number) without unnecessary hierarchy, with one-tap calling and WhatsApp.
- **Audit & Reports**: Instant generation of PDF receipts, balance sheets, and CSV exports.

### ⚡ Offline-First Architecture (PWA)
- **Workbox Service Worker**: Full offline support for Public Home, Schedules, and Mankari lists during weak festival ground network conditions.
- **Cache-First / Stale-While-Revalidate**: Instant rendering with background data synchronization.
- **Graceful Offline Mode**: Visual indicators and friendly bilingual messages preventing failed transactions when disconnected.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <your-repository-url>

# Navigate into project directory
cd "Mandal Management"

# Install dependencies
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build & Preview
```bash
# Build the production bundle
npm run build

# Preview the production PWA locally
npm run preview
```

---

## 🛠️ Tech Stack
- **Framework**: React 18, Vite 6
- **PWA**: `vite-plugin-pwa`, Workbox
- **Styling**: Tailwind CSS, Custom Devanagari & Modern Typography
- **Database / Sync**: Firebase Firestore (Offline persistence enabled) / `localStorage` fallback
- **Exports & Graphics**: `jspdf`, `jspdf-autotable`, `qrcode.react`, `canvas-confetti`
