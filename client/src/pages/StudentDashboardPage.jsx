import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, BookOpen, Clock, Trophy, Sparkles,
  ArrowRight, Bookmark, CheckCircle, Download, ShoppingBag,
  ExternalLink, BarChart3, ChevronRight, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';

export default function StudentDashboardPage({ onOpenReader, onOpenPayment, onToggleSave, savedBookIds, purchasedBookIds }) {
  const { user, token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch('/api/library/dashboard-summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(resData => {
          setData(resData);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [token]);

  if (loading) {
    return <div className="py-24 text-center text-slate-400">Loading student dashboard...</div>;
  }

  const stats = data?.stats || {
    totalLibraryItems: 3,
    purchasedCount: 2,
    averageProgress: 60,
    totalOrdersCount: 2,
    aiInteractionsCount: 3
  };

  const recentlyRead = data?.recentlyRead || [];
  const purchasedNotes = data?.purchasedNotes || [];
  const savedBooks = data?.savedBooks || [];
  const aiHistory = data?.aiHistory || [];
  const recommendations = data?.recommendations || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">

      {/* Welcome Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-indigo-500/30">
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">{user?.name || 'Student Learner'}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 uppercase">
                {user?.role || 'Student'}
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              {user?.college || 'Computer Science & Engineering'} • {user?.semester || 'Semester 6'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            to="/ai-assistant"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Launch AI Tutor
          </Link>
          <Link
            to="/library"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
          >
            Open My Library
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Library Items</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalLibraryItems}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Saved & Purchased</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Purchased Notes</span>
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.purchasedCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Lifetime Unlocked</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Avg. Progress</span>
            <BarChart3 className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.averageProgress}%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Reading Completion</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">AI Queries</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.aiInteractionsCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Quizzes & Summaries</p>
        </div>
      </div>

      {/* Currently Reading / Recently Read */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" /> Currently Reading
          </h2>
          <Link to="/library" className="text-xs font-semibold text-indigo-600 hover:underline">
            View All in Library
          </Link>
        </div>

        {recentlyRead.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentlyRead.map((item) => (
              <div
                key={item.bookId}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex gap-4 items-center"
              >
                <img
                  src={item.book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'}
                  alt={item.book.title}
                  className="w-16 h-20 object-cover rounded-xl shadow-sm shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                      {item.book.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.book.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate">Page {item.lastReadPage} of {item.book.pages || 100}</p>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full"
                        style={{ width: `${item.progress || 20}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>{item.progress}% Completed</span>
                      <button
                        onClick={() => onOpenReader && onOpenReader(item.book)}
                        className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                      >
                        Resume Reading <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-2xl">
            No active reading books yet. Explore the catalog and start reading!
          </div>
        )}
      </section>

      {/* 2-Column: Purchased Notes + AI Study History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* Purchased Notes */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-500" /> My Purchased Notes ({purchasedNotes.length})
            </h3>
            <Link to="/orders" className="text-xs text-indigo-600 hover:underline">
              Order Receipts
            </Link>
          </div>

          <div className="space-y-3">
            {purchasedNotes.map((item) => (
              <div key={item.bookId} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{item.book.title}</p>
                  <p className="text-[11px] text-slate-400">By {item.book.author} • Unlocked</p>
                </div>
                <button
                  onClick={() => onOpenReader && onOpenReader(item.book)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-[11px] shrink-0"
                >
                  Read PDF
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* AI Study History */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" /> Recent AI Study History
            </h3>
            <Link to="/ai-assistant" className="text-xs text-purple-600 hover:underline">
              Open AI Suite
            </Link>
          </div>

          <div className="space-y-3">
            {aiHistory.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.title}</span>
                  <span className="text-[10px] uppercase font-bold text-purple-500 shrink-0 ml-2">{item.type}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{item.resultPreview}</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Recommended Materials */}
      {recommendations.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recommended for Your Curriculum
            </h2>
            <Link to="/books" className="text-xs text-indigo-600 hover:underline">
              Explore Store
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((rec) => (
              <BookCard
                key={rec.id}
                book={rec}
                onPreview={onOpenReader}
                onBuy={onOpenPayment}
                onToggleSave={onToggleSave}
                isSaved={savedBookIds?.has(rec.id)}
                isPurchased={purchasedBookIds?.has(rec.id)}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
