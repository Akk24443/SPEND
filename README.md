# 🪙 Spend — Elegant Multi-Currency Expense & Trip Tracker

Spend is a premium, state-of-the-art expense tracking application designed with rich aesthetics, smooth micro-animations, and full offline-first multi-currency support. Seamlessly track personal expenses, manage budgets across different currencies, and coordinate travel expenses for custom trips.

---

## ✨ Features

- **📊 Beautiful Dashboard**: A stunning dark-mode/glassmorphic visual interface showcasing total balance, monthly limits, and real-time expense breakdowns.
- **💱 Multi-Currency & Live Converter**: Built-in dynamic currency conversion with support for custom base currencies and live conversion.
- **✈️ Trip Travel Budgets**: Group expenses under custom travel trips to monitor your budget and travel spending in real-time.
- **🔥 Firebase Backend Integration**: Real-time synchronization and secure data storage so you never lose your transactions.
- **📅 Google Calendar Sync**: Automatically synchronize and schedule recurring or critical expense dates straight to your personal calendar.
- **📄 PDF & Excel Reports**: Export clean, structured data tables and reports of your expenses in PDF or XLSX format.
- **📱 Capacitor Mobile Ready**: Completely configured to compile into a native Android/iOS application out of the box.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Motion (for premium micro-animations)
- **UI Components**: Shadcn UI, Radix UI
- **Database & Auth**: Firebase / Firestore
- **Charts & Reports**: Recharts, jsPDF, SheetJS (XLSX)

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Steps
1. **Clone & Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup Environment Variables**:
   Create a `.env` or `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   ```
3. **Run Dev Server**:
   ```bash
   npm run dev
   ```

---

## 🌍 Vercel Deployment

This project is optimized for direct, one-click deployment on **Vercel** with a pre-configured `vercel.json` file to handle routing flawlessly:

1. Connect your GitHub repository to Vercel.
2. Under project settings, Vercel will automatically detect the **Vite** configuration.
3. Configure your Environment Variables (like `GEMINI_API_KEY`) under Vercel project settings.
4. Click **Deploy**!

---

## 📱 Mobile Export (Capacitor)

To compile the application to an Android APK:
```bash
npm run android:sync
npm run android:open
```
This will sync all web assets into the Android native template and launch Android Studio.