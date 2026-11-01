import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, Download, Eye, Bookmark, BookOpen, Check,
  ShieldCheck, Share2, Sparkles, ChevronRight, Lock
} from 'lucide-react';
import BookCard from '../components/BookCard';

export default function BookDetailPage({ onOpenReader, onOpenPayment, onToggleSave, savedBookIds, purchasedBookIds }) {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/books/${id}`)
      .then(res => res.json())
      .then(data => {
        setBook(data.book);
        setRelated(data.related || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-slate-400">Loading book details...</div>;
  }

  if (!book) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-xl font-bold">Book Not Found</h2>
        <Link to="/books" className="text-xs text-indigo-600 font-bold hover:underline">
          Return to All Books
        </Link>
      </div>
    );
  }

  const isSaved = savedBookIds?.has(book.id);
  const isPurchased = purchasedBookIds?.has(book.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-slate-600 dark:hover:text-slate-200">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/books" className="hover:text-slate-600 dark:hover:text-slate-200">Books</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/books?category=${encodeURIComponent(book.category)}`} className="hover:text-slate-600 dark:hover:text-slate-200">{book.category}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[200px]">{book.title}</span>
      </nav>

      {/* Main Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left: Book Cover & Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover"
            />
            {book.isFree && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-lg">
                FREE EDITION
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onToggleSave && onToggleSave(book.id)}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                isSaved
                  ? 'border-rose-300 bg-rose-50 text-rose-600 dark:bg-rose-950/50'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
              {isSaved ? 'Saved in Library' : 'Save Book'}
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {copied && <span className="text-[10px] text-emerald-600 self-center">Copied!</span>}
          </div>
        </div>

        {/* Right: Book Details & Table of Contents */}
        <div className="lg:col-span-8 space-y-6">

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                {book.category}
              </span>
              <span className="text-xs text-slate-400">• {book.type === 'notes' ? 'Student Notes' : 'Textbook'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {book.title}
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Authored by <strong className="text-slate-800 dark:text-slate-200">{book.author}</strong>
            </p>

            {/* Ratings and Stats */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-800 dark:text-slate-200">{book.rating || 4.9}</span>
                <span className="text-slate-400">({book.reviewsCount || 150} Student Reviews)</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>{book.pages} Pages</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>Language: {book.language || 'English'}</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>{book.readsCount || 1200}+ Active Readers</span>
            </div>
          </div>

          {/* Pricing & CTA Card */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Purchase or Read</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                {book.isFree ? (
                  <span className="text-2xl font-black text-emerald-600">FREE</span>
                ) : (
                  <>
                    <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">₹{book.price}</span>
                    <span className="text-xs text-slate-400 line-through">₹{book.price * 2}</span>
                    <span className="text-xs font-bold text-emerald-600">(50% Student Discount)</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Includes unlimited online browser reader & verified PDF file.</p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => onOpenReader && onOpenReader(book)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-4 h-4 text-indigo-500" />
                Read Online Preview
              </button>

              {isPurchased ? (
                <button
                  onClick={() => onOpenReader && onOpenReader(book)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Check className="w-4 h-4" /> Unlocked in Library
                </button>
              ) : book.isFree ? (
                <button
                  onClick={() => onOpenReader && onOpenReader(book)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-4 h-4" /> Download Free
                </button>
              ) : (
                <button
                  onClick={() => onOpenPayment && onOpenPayment(book)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                >
                  <Lock className="w-4 h-4" /> Buy Now (₹{book.price})
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              About This Material
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {book.description}
            </p>
          </div>

          {/* Table of Contents */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" /> Syllabus & Table of Contents
            </h3>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden bg-white dark:bg-slate-900">
              {(book.tableOfContents && book.tableOfContents.length > 0 ? book.tableOfContents : [
                'Chapter 1: Mathematical Foundations & Preliminaries',
                'Chapter 2: Algorithms, State Invariants & Complexity Proofs',
                'Chapter 3: System Architecture & Data Flow Implementation',
                'Chapter 4: Previous Year University Exam Questions with Solved Proofs'
              ]).map((chapter, i) => (
                <div key={i} className="p-3.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{chapter}</span>
                  <button
                    onClick={() => onOpenReader && onOpenReader(book)}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Preview
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Related Books */}
      {related.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            More in {book.category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((item) => (
              <BookCard
                key={item.id}
                book={item}
                onPreview={onOpenReader}
                onBuy={onOpenPayment}
                onToggleSave={onToggleSave}
                isSaved={savedBookIds?.has(item.id)}
                isPurchased={purchasedBookIds?.has(item.id)}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
