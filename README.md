# AI Reads – Smart Notes & Books Learning Platform
> **Tagline:** *Read Smarter. Learn Faster. Grow Better.*

A modern, professional, fully responsive full-stack educational web application where students can read, download, purchase digital notes, books, and PDFs with Razorpay payment integration, and use a suite of cutting-edge AI-powered study tools.

---

## 🌟 Key Features

### 1. Modern & Premium UI/UX
- **Light & Dark Mode**: Seamless toggle with persistent preference in `localStorage`.
- **Fully Responsive**: Mobile-first design for smartphones, tablets, and desktop workstations.
- **Glassmorphism & Micro-animations**: Tailored smooth hover states, animated badges, and intuitive card layouts.
- **Dynamic Search & Quick Filter**: Global keyboard shortcut search (`Cmd/Ctrl + K`) across all 16 academic categories.

### 2. Complete 16 Academic Categories
1. **Artificial Intelligence**
2. **Machine Learning**
3. **Deep Learning**
4. **Data Science**
5. **Python Programming**
6. **Java Programming**
7. **C Programming**
8. **HTML & CSS**
9. **Database Management System (DBMS)**
10. **Operating System (OS)**
11. **Computer Networks (CN)**
12. **Mathematics**
13. **Cyber Security**
14. **Engineering Books**
15. **College Notes**
16. **Competitive Exam Notes (GATE / Placement)**

### 3. AI Study Assistant Suite
- **Upload PDF & Ask Questions**: Drag-and-drop any PDF or syllabus document to extract text and engage in context-aware doubt resolution.
- **Document Summarizer**: Choose between concise Executive Briefs or Chapter-Wise breakdowns.
- **Short Notes & Formula Sheets**: Generate high-yield college notes with formulas, mnemonics, and definitions ready for print.
- **Interactive MCQ Quiz Generator**: Timed practice tests with multiple choices, instant grading, and detailed answer explanations.
- **Bilingual Concept Explainer**: Toggle between Simple English and Hindi (Hinglish) with real-world analogies.
- **Important Exam Questions**: Predicted 2-mark, 5-mark, and 10-mark questions with step-by-step model answers.
- **3D Memory Flashcards**: Interactive flippable cards with active recall testing and mastery navigation.
- **Text-to-Notes Synthesizer**: Converts raw lecture transcripts into clean study notes.

### 4. Digital E-Book & PDF Reader
- Embedded online reader with page flip controls, progress tracking, and zoom.
- Reading themes: **Day**, **Sepia**, and **Night** mode.
- Built-in **AI Study Copilot Sidebar** right inside the reader for on-the-fly page summaries and terminology explanation.
- **Text-to-Speech (Audio Reader)**: Listen to textbook chapters using browser Web Speech synthesis.

### 5. Razorpay Payment Gateway Integration
- **Micro-Pricing Options**: ₹49, ₹99, ₹149, and ₹199 pricing tiers for maximum student affordability.
- **Instant Digital Unlocking**: Once payment is verified, the item is immediately unlocked to the student's personal library.
- **Automatic Sandbox Mode**: Seamless testing out of the box even without active payment keys. Real production HMAC SHA-256 signature verification enabled upon supplying credentials.
- **Invoices & Receipts**: Printable PDF receipt generator.

### 6. Student & Admin Dashboards
- **Student Dashboard**: Recently read books with progress bars, purchased notes shelf, AI interaction history, and personalized recommendations.
- **Admin Dashboard**: Manage books (upload, edit price, toggle featured, delete), add categories, view platform analytics (revenue, orders, active users), and view user registrations.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Canvas Confetti, React Router v6.
- **Backend**: Node.js, Express.js, Multer, PDF-Parse, JWT, BcryptJS, Razorpay SDK.
- **Database**: In-memory + persistent store with Supabase PostgreSQL schema (`server/supabase_schema.sql`).
- **Payment Gateway**: Razorpay.
- **AI Intelligence**: OpenAI API integration with smart local fallback generator.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation
Clone or navigate to the project directory:
```bash
cd /Users/alokkumar/.gemini/antigravity/scratch/ai-reads
```

Install dependencies for both server and client:
```bash
npm run setup
```

### Running the Application

#### Option A: Production Mode (Both Frontend & Backend on Port 5001)
Build the frontend and launch the unified server:
```bash
npm run build
npm start
```
Visit `http://localhost:5001` in your browser.

#### Option B: Development Mode (Vite Hot-Reload)
In one terminal, start the backend server:
```bash
cd server
npm start
```
In a second terminal, start the Vite client:
```bash
cd client
npm run dev
```
Visit `http://localhost:5173` in your browser.

---

## 🔑 Demo Test Accounts

The platform comes pre-configured with instant demo accounts for immediate testing:

| Role | Email | Password | Features |
| :--- | :--- | :--- | :--- |
| **Student** | `student@aireads.com` | `password123` | Library, Orders, Dashboard, AI Tools, Payment |
| **Admin** | `admin@aireads.com` | `admin123` | Analytics, Book Upload, Category Manager, Users |

*(You can also use the one-click role switcher in the navbar or Auth Modal to switch seamlessly without logging in!)*

---

## ⚙️ Environment Configuration

Edit `server/.env` to configure your credentials:

```env
PORT=5001
JWT_SECRET=your-secret-key

# Razorpay Credentials (Optional for sandbox testing, required for live payments)
RAZORPAY_KEY_ID=rzp_test_YourKeyId
RAZORPAY_KEY_SECRET=YourSecretKey

# OpenAI API Key (Optional: smart educational fallback active when omitted)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini

# Supabase Credentials (For cloud sync)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

---

## 🗄️ Supabase PostgreSQL Setup

To sync with a cloud Supabase project:
1. Log into your [Supabase Dashboard](https://supabase.com).
2. Create a new project.
3. Open the **SQL Editor** in your Supabase dashboard.
4. Copy the entire contents of [`server/supabase_schema.sql`](file:///Users/alokkumar/.gemini/antigravity/scratch/ai-reads/server/supabase_schema.sql) and click **Run**.
5. Copy your project URL and anon public key into `server/.env`.

---

## 📄 License
ISC © AI Reads. Built for passionate learners worldwide.
