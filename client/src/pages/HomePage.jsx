import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, Search, BookOpen, BrainCircuit, Cpu, BarChart3,
  Code2, FileCode, Terminal, Layout, Database, HardDrive,
  Network, Sigma, ShieldCheck, GraduationCap, Trophy,
  ArrowRight, Star, CheckCircle2, Zap, Download, HelpCircle,
  Users, Layers, BookMarked, ChevronRight
} from 'lucide-react';
import BookCard from '../components/BookCard';

export default function HomePage({ onOpenReader, onOpenPayment, onToggleSave, savedBookIds, purchasedBookIds }) {
  const [categories, setCategories] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [freeMaterials, setFreeMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(err => console.error(err));

    // Fetch featured books
    fetch('/api/books?featured=true')
      .then(res => res.json())
      .then(data => setFeaturedBooks((data.books || []).slice(0, 8)))
      .catch(err => console.error(err));

    // Fetch free materials
    fetch('/api/books?isFree=true')
      .then(res => res.json())
      .then(data => setFreeMaterials((data.books || []).slice(0, 4)))
      .catch(err => console.error(err));
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Map category names to icons
  const getCategoryIcon = (name) => {
    switch (name) {
      case 'Artificial Intelligence': return <Sparkles className="w-6 h-6 text-indigo-500" />;
      case 'Machine Learning': return <BrainCircuit className="w-6 h-6 text-purple-500" />;
      case 'Deep Learning': return <Cpu className="w-6 h-6 text-cyan-500" />;
      case 'Data Science': return <BarChart3 className="w-6 h-6 text-emerald-500" />;
      case 'Python Programming': return <Code2 className="w-6 h-6 text-blue-500" />;
      case 'Java Programming': return <FileCode className="w-6 h-6 text-amber-500" />;
      case 'C Programming': return <Terminal className="w-6 h-6 text-rose-500" />;
      case 'HTML & CSS': return <Layout className="w-6 h-6 text-orange-500" />;
      case 'Database Management System': return <Database className="w-6 h-6 text-teal-500" />;
      case 'Operating System': return <HardDrive className="w-6 h-6 text-violet-500" />;
      case 'Computer Networks': return <Network className="w-6 h-6 text-sky-500" />;
      case 'Mathematics': return <Sigma className="w-6 h-6 text-red-500" />;
      case 'Cyber Security': return <ShieldCheck className="w-6 h-6 text-green-500" />;
      case 'Engineering Books': return <BookOpen className="w-6 h-6 text-fuchsia-500" />;
      case 'College Notes': return <GraduationCap className="w-6 h-6 text-yellow-500" />;
      case 'Competitive Exam Notes': return <Trophy className="w-6 h-6 text-amber-400" />;
      default: return <BookMarked className="w-6 h-6 text-indigo-500" />;
    }
  };

  const faqs = [
    {
      q: 'How do I download or read digital books and notes?',
      a: 'Free materials can be downloaded or read online immediately with 1-click. For paid notes, simply click "Buy Now" to checkout securely with Razorpay. Once verified, the PDF is permanently unlocked in your "My Library" dashboard with online reading and offline download support.'
    },
    {
      q: 'How does the AI Study Assistant work with my PDFs?',
      a: 'You can upload your own syllabus PDF or choose any textbook from AI Reads. Our AI Assistant can answer specific conceptual questions, produce chapter summaries, generate interactive MCQ quizzes with score tracking, and explain complex engineering theorems in both simple English and Hindi!'
    },
    {
      q: 'What are the pricing options on AI Reads?',
      a: 'We believe education should be universally affordable. Aside from hundreds of 100% Free study materials, premium verified notes are priced at budget-friendly tiers of ₹49, ₹99, ₹149, and ₹199 with no recurring monthly subscriptions.'
    },
    {
      q: 'Is Razorpay payment secure?',
      a: 'Yes! AI Reads integrates Razorpay with 256-bit bank-grade SSL encryption supporting UPI (Google Pay, PhonePe, Paytm), Debit/Credit cards, and Net Banking. All payments are verified cryptographically via HMAC signatures.'
    }
  ];

  return (
    <div className="space-y-20 pb-20">

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 gradient-hero border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>Next-Gen Smart Learning Platform for Engineering & College Students</span>
          </div>

          {/* Main Title & Tagline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
            Read Smarter. <br className="hidden sm:inline" />
            <span className="gradient-text">Learn Faster.</span> Grow Better.
          </h1>

          <p className="mt-5 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Access thousands of curated books, topper handwritten notes, and university revision capsules powered by an interactive AI Study Assistant.
          </p>

          {/* Hero Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form onSubmit={handleHeroSearch} className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-500/10">
              <div className="flex-1 flex items-center px-3 gap-2">
                <Search className="w-5 h-5 text-indigo-500 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 16+ subjects: AI, Python, DBMS, GATE Notes, OS..."
                  className="w-full bg-transparent py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Search Library</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Filter Chips */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Quick explore:</span>
              {['Artificial Intelligence', 'Machine Learning', 'Python', 'College Notes', 'Competitive Exam Notes'].map((tag) => (
                <Link
                  key={tag}
                  to={`/books?category=${encodeURIComponent(tag)}`}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-400 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t border-slate-200/80 dark:border-slate-800">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">50,000+</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Students Learning</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">10,000+</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Books & PDF Notes</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">99.4%</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Exam Pass Rate</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-500">₹49 - ₹199</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Student Friendly Pricing</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. 16 CATEGORIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mb-2">
              <Layers className="w-3.5 h-3.5" /> Curated Subjects
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Explore All 16 Academic Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              From foundational engineering to advanced AI and competitive exams.
            </p>
          </div>
          <Link
            to="/books"
            className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/books?category=${encodeURIComponent(cat.name)}`}
              className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-sm hover:shadow-xl transition-all duration-300 card-hover flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                  {getCategoryIcon(cat.name)}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                  {cat.count}+ Items
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {cat.description || 'Comprehensive notes and textbooks'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED BOOKS & NOTES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 mb-2">
              <Star className="w-3.5 h-3.5 fill-purple-500" /> Editor's Choice
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Featured Books & Best-Selling Notes
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Top rated by students and university toppers with 4.8+ average rating.
            </p>
          </div>
          <Link
            to="/books"
            className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Browse All Books</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onPreview={onOpenReader}
              onBuy={onOpenPayment}
              onToggleSave={onToggleSave}
              isSaved={savedBookIds?.has(book.id)}
              isPurchased={purchasedBookIds?.has(book.id)}
            />
          ))}
        </div>
      </section>

      {/* 4. AI STUDY ASSISTANT SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 text-white shadow-2xl relative overflow-hidden border border-indigo-700/50">

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-purple-300 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-spin" />
                AI-Powered Study Intelligence
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                Turn Any PDF or Textbook into an Interactive Tutor
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                Upload your engineering notes or syllabus. Our AI analyzes the material to answer doubts, summarize chapters, generate realistic MCQ quizzes, and even explain difficult theorems in simple bilingual Hindi and English!
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PDF Q&A Chatbot</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive MCQs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bilingual Explanations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Exam Questions (10M)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>3D Flashcards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Chapter Summaries</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <Link
                  to="/ai-assistant"
                  className="px-6 py-3 rounded-xl bg-white text-indigo-900 font-bold text-xs shadow-lg hover:bg-slate-100 transition-all flex items-center gap-2"
                >
                  <span>Launch AI Study Assistant</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Interactive Mock Preview Card */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="font-mono text-[11px] text-purple-200 ml-1">AI Copilot Demo</span>
                </div>
                <span className="text-[10px] bg-purple-500/30 px-2 py-0.5 rounded text-purple-200">Active</span>
              </div>

              <div className="p-3 rounded-xl bg-black/20 text-slate-200">
                <p className="text-[11px] font-semibold text-purple-300 mb-0.5">Student Prompt:</p>
                <p>"Explain Dijkstra's shortest path algorithm in simple Hindi and English."</p>
              </div>

              <div className="p-3 rounded-xl bg-white/15 text-white space-y-1.5 border border-white/10">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px]">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Response:</span>
                </div>
                <p className="leading-relaxed">
                  <strong>English:</strong> Greedy algorithm using a Priority Queue with $O((V + E) \log V)$ time. Always explores the unvisited node with minimum tentative distance.
                </p>
                <p className="leading-relaxed text-indigo-200">
                  <strong>हिंदी:</strong> सबसे छोटा रास्ता ढूँढने का तरीका। जैसे Google Maps हमेशा सबसे कम दूरी वाला मोड़ चुनता है!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FREE STUDY MATERIALS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-2">
              <Download className="w-3.5 h-3.5" /> 100% Free Resources
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Free Study Materials & Revision Packs
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Zero cost, instant browser reading and direct PDF download for every learner.
            </p>
          </div>
          <Link
            to="/free"
            className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Explore All Free Notes</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {freeMaterials.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onPreview={onOpenReader}
              onBuy={onOpenPayment}
              onToggleSave={onToggleSave}
              isSaved={savedBookIds?.has(book.id)}
              isPurchased={purchasedBookIds?.has(book.id)}
            />
          ))}
        </div>
      </section>

      {/* 6. WHY CHOOSE AI READS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Why Students Love Us
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Built for Academic Excellence
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Everything an ambitious student needs to score top grades and ace technical interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Topper Verified Notes
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Curated handwritten notes from IIT, NIT, and university rank holders formatted specifically according to university semester syllabus.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Instant 24/7 AI Tutor
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Stuck on an algorithm or proof at 2 AM? Get instant step-by-step explanations, bilingual breakdowns, and practice MCQs in seconds.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Micro-Pricing (₹49 - ₹199)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No bloated subscriptions. Pay a modest one-time amount per book or subject pack and enjoy lifetime online reading and download access.
            </p>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className={`text-slate-400 font-bold transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-xl text-center space-y-5 relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl font-extrabold max-w-2xl mx-auto">
            Ready to Supercharge Your Academic Journey?
          </h2>
          <p className="text-sm sm:text-base text-indigo-100 max-w-xl mx-auto">
            Join over 50,000+ students across India who are studying smarter and scoring higher with AI Reads.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/books"
              className="px-6 py-3 rounded-xl bg-white text-indigo-700 font-bold text-xs shadow-lg hover:bg-slate-100 transition-all"
            >
              Explore Study Materials
            </Link>
            <Link
              to="/ai-assistant"
              className="px-6 py-3 rounded-xl bg-indigo-900/60 hover:bg-indigo-900 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              Try AI Assistant Free
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
