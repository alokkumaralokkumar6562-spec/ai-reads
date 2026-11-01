import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  GraduationCap, Search, Sparkles, Trophy, BookOpen,
  Filter, Tag, Check
} from 'lucide-react';
import BookCard from '../components/BookCard';

export default function AllNotesPage({ onOpenReader, onOpenPayment, onToggleSave, savedBookIds, purchasedBookIds }) {
  const [searchParams] = useSearchParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubtype, setSelectedSubtype] = useState('all'); // 'all' | 'college' | 'exam' | 'handwritten'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/books')
      .then(res => res.json())
      .then(data => {
        // Filter items that are notes or exam/college focused
        const allItems = data.books || [];
        const noteItems = allItems.filter(b =>
          b.type === 'notes' ||
          b.category === 'College Notes' ||
          b.category === 'Competitive Exam Notes'
        );
        setNotes(noteItems);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredNotes = notes.filter(n => {
    if (selectedSubtype === 'college' && n.category !== 'College Notes') return false;
    if (selectedSubtype === 'exam' && n.category !== 'Competitive Exam Notes') return false;
    if (selectedSubtype === 'free' && !n.isFree) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return n.title.toLowerCase().includes(q) || n.author.toLowerCase().includes(q) || n.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

      {/* Header */}
      <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-purple-200 border border-white/15">
            <GraduationCap className="w-3.5 h-3.5" /> High-Yield Revision Repository
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">
            All Student & Topper Notes
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Handwritten diagrams, concise formulas, previous year question trends, and placement capsules curated directly by university rank-holders.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in notes..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:bg-white/20"
            />
          </div>
        </div>
      </div>

      {/* Pill Filters */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'all', label: 'All Notes Catalog' },
          { id: 'college', label: '🎓 College & Semester Notes' },
          { id: 'exam', label: '🏆 Competitive Exam (GATE / Placement)' },
          { id: 'free', label: '⚡ 100% Free Notes' }
        ].map(pill => (
          <button
            key={pill.id}
            onClick={() => setSelectedSubtype(pill.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedSubtype === pill.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Catalog */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading notes...</div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredNotes.map((note) => (
            <BookCard
              key={note.id}
              book={note}
              onPreview={onOpenReader}
              onBuy={onOpenPayment}
              onToggleSave={onToggleSave}
              isSaved={savedBookIds?.has(note.id)}
              isPurchased={purchasedBookIds?.has(note.id)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 space-y-2">
          <p className="font-bold text-slate-700 dark:text-slate-300">No notes found for this category</p>
          <button
            onClick={() => { setSelectedSubtype('all'); setSearchQuery(''); }}
            className="text-xs text-indigo-600 font-bold hover:underline"
          >
            View all available notes
          </button>
        </div>
      )}

    </div>
  );
}
