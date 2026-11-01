import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Sparkles, Target, Eye, ShieldCheck, Heart,
  Zap, Code2, Database, CreditCard, ArrowRight, CheckCircle2
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">

      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-900">
          <BookOpen className="w-3.5 h-3.5" /> Our Story & Educational Mission
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
          Democratizing Quality Technical Education for Every Student
        </h1>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
          <strong>AI Reads</strong> was built with a singular mission: to eliminate the friction between complex engineering curricula and student understanding. By pairing authoritative textbooks and topper handwritten notes with an active AI study copilot, we help you <strong className="text-indigo-600 dark:text-indigo-400">Read Smarter, Learn Faster, and Grow Better.</strong>
        </p>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Our Mission</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            To provide every engineering student—regardless of tier-1 or tier-3 college background—instant access to university-aligned handwritten notes, standard textbooks, and an intelligent AI study copilot at unbeatable micro-pricing (₹49 to ₹199).
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Our Vision</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            To become India's most trusted digital learning companion, revolutionizing how students prepare for university semester examinations, technical campus placements, and competitive gateways like GATE and UGC NET.
          </p>
        </div>
      </div>

      {/* Technology Architecture Showcase */}
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white shadow-xl space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Engineered with Modern Standards
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Platform Technology Stack
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Built from the ground up for speed, mobile responsiveness, and bank-grade transaction safety.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Code2 className="w-4 h-4" /> Frontend
            </div>
            <p className="font-semibold text-white">React.js + Tailwind CSS</p>
            <p className="text-slate-400">High-performance SPA with light/dark theme switching and mobile-first responsive layout.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Database className="w-4 h-4" /> Backend & Database
            </div>
            <p className="font-semibold text-white">Node.js Express + Supabase</p>
            <p className="text-slate-400">Modular REST API with PostgreSQL schema, RLS policies, and encrypted JWT authentication.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <CreditCard className="w-4 h-4" /> Payments
            </div>
            <p className="font-semibold text-white">Razorpay Payment Gateway</p>
            <p className="text-slate-400">256-bit SSL encrypted checkout with UPI, Cards, NetBanking, and instant HMAC cryptographic verification.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <Sparkles className="w-4 h-4" /> Intelligence
            </div>
            <p className="font-semibold text-white">OpenAI & AI Study Suite</p>
            <p className="text-slate-400">Dynamic PDF text extraction, bilingual Hindi+English reasoning, timed MCQ generator, and 3D flashcards.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-8">
        <Link
          to="/books"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
        >
          <span>Start Learning Today</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
