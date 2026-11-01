import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, Sparkles, ArrowRight, Tag } from 'lucide-react';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle search modal
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/books?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.books || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectBook = (bookId) => {
    onClose();
    navigate(`/book/${bookId}`);
  };

  const popularSearches = [
    'Artificial Intelligence', 'Machine Learning', 'Data Science',
    'Python', 'Operating System', 'DBMS', 'GATE CS Notes'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">

        {/* Input box */}
        <div className="flex items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, topper notes, engineering subjects, or exams..."
            autoFocus
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Popular Tags */}
        {!query && (
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Popular Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-400 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-3 space-y-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Searching catalog...</div>
          ) : results.length > 0 ? (
            results.map((book) => (
              <div
                key={book.id}
                onClick={() => handleSelectBook(book.id)}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
              >
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-10 h-14 object-cover rounded-lg shadow-sm shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                      {book.category}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-100 dark:bg-slate-800">
                      {book.isFree ? 'FREE' : `₹${book.price}`}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">By {book.author}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))
          ) : query ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No matching books or notes found for "{query}". Try searching by subject or author.
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-[11px] text-slate-400">
          <span>Search in all 16 academic subjects</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" /> AI-indexed library
          </span>
        </div>

      </div>
    </div>
  );
}
