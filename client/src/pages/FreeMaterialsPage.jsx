import React, { useState, useEffect } from 'react';
import { Download, Sparkles, Gift, BookOpen, CheckCircle, Search } from 'lucide-react';
import BookCard from '../components/BookCard';

export default function FreeMaterialsPage({ onOpenReader, onToggleSave, savedBookIds, purchasedBookIds }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/books?isFree=true')
      .then(res => res.json())
      .then(data => {
        setMaterials(data.books || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = materials.filter(m => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return m.title.toLowerCase().includes(q) || m.author.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

      {/* Header Banner */}
      <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <Gift className="w-3.5 h-3.5" /> 100% Free Public Education Initiative
          </div>
          <h1 className="text-3xl sm:text-5xl font-black">
            Free Study Materials & Notes
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Free access for all students. No credit card, no hidden fees. Download verified notes and read online directly in your browser.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs space-y-2 shrink-0">
          <p className="font-bold text-white flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Free Benefits Included:
          </p>
          <ul className="space-y-1 text-emerald-200">
            <li>• Unlimited Instant Browser Reading</li>
            <li>• 1-Click High-Res PDF Downloads</li>
            <li>• AI Summaries & Flashcards Support</li>
          </ul>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <p className="text-xs font-semibold text-slate-500">
          Showing {filtered.length} free resources
        </p>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search free materials..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading free library...</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <BookCard
              key={item.id}
              book={item}
              onPreview={onOpenReader}
              onBuy={() => onOpenReader(item)}
              onToggleSave={onToggleSave}
              isSaved={savedBookIds?.has(item.id)}
              isPurchased={purchasedBookIds?.has(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-slate-400">
          No free study materials found matching "{search}".
        </div>
      )}

    </div>
  );
}
