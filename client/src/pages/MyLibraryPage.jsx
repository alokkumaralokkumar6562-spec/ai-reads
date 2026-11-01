import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderHeart, BookOpen, Search, Download, Eye,
  ArrowRight, Sparkles, Filter, CheckCircle2, Bookmark
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MyLibraryPage({ onOpenReader, onToggleSave }) {
  const { user, token } = useAuth();
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'purchased' | 'saved'
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (token) {
      fetch('/api/library', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setLibrary(data.library || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [token]);

  const filtered = library.filter(item => {
    if (filterTab === 'purchased' && !item.isPurchased) return false;
    if (filterTab === 'saved' && !item.isSaved) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.book?.title?.toLowerCase().includes(q) ||
        item.book?.author?.toLowerCase().includes(q) ||
        item.book?.category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
            <FolderHeart className="w-4 h-4" /> Personal Study Shelf
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            My Library & Saved Notes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Your unlocked books, purchased notes, and reading progress synchronized across devices.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your library..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: `All Items (${library.length})` },
          { id: 'purchased', label: `Purchased Notes (${library.filter(i => i.isPurchased).length})` },
          { id: 'saved', label: `Saved Free Books (${library.filter(i => i.isSaved && !i.isPurchased).length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Library Cards */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading library...</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item) => {
            const { book, progress = 0, lastReadPage = 1, isPurchased } = item;
            return (
              <div
                key={item.bookId}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all"
              >
                <div>
                  <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {isPurchased ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow">
                          PURCHASED
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow">
                          SAVED
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                      {book.category}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-400">By {book.author}</p>

                    {/* Progress Slider */}
                    <div className="pt-2">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>Page {lastReadPage} of {book.pages || 100}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex gap-2">
                  <button
                    onClick={() => onOpenReader && onOpenReader(book)}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Read Now
                  </button>
                  <button
                    onClick={() => alert(`Downloading verified PDF for ${book.title}`)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Your Library is Empty
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our catalog of textbooks and topper notes to add free or premium resources to your personal shelf.
          </p>
          <Link
            to="/books"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
          >
            Explore Books & Notes Store
          </Link>
        </div>
      )}

    </div>
  );
}
