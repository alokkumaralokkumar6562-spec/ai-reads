import React, { useState, useEffect } from 'react';
import { ShieldCheck, Tag, Zap, Star, ArrowRight } from 'lucide-react';
import BookCard from '../components/BookCard';

export default function PaidMaterialsPage({ onOpenReader, onOpenPayment, onToggleSave, savedBookIds, purchasedBookIds }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('all'); // 'all' | '49' | '99' | '149' | '199'

  useEffect(() => {
    setLoading(true);
    fetch('/api/books?isFree=false')
      .then(res => res.json())
      .then(data => {
        setItems(data.books || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const priceTiers = [
    { id: 'all', label: 'All Premium Materials', desc: 'Complete catalog' },
    { id: '49', label: '₹49 Tier', desc: 'Quick Interview Capsules & Revision Decks' },
    { id: '99', label: '₹99 Tier', desc: 'Full Subject Notes & Semester Bundles' },
    { id: '149', label: '₹149 Tier', desc: 'Standard Core Engineering Textbooks' },
    { id: '199', label: '₹199 Tier', desc: 'Comprehensive Handbooks & 15-Yr Solved Papers' },
  ];

  const filtered = items.filter(b => {
    if (selectedTier === 'all') return true;
    return b.price === Number(selectedTier);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

      {/* Header */}
      <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <Zap className="w-3.5 h-3.5 fill-amber-300" /> Affordable Micro-Pricing Model
          </div>
          <h1 className="text-3xl sm:text-5xl font-black">
            Premium Study Materials
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
            Invest in your future with affordable one-time pricing starting from just ₹49. Razorpay verified instant digital download and unlimited online reader access.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs space-y-2 shrink-0">
          <p className="font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" /> Razorpay Guarantee:
          </p>
          <ul className="space-y-1 text-indigo-200">
            <li>• Instant automatic library unlock</li>
            <li>• Lifetime reading progress saving</li>
            <li>• Verified payments with invoice download</li>
          </ul>
        </div>
      </div>

      {/* Price Tier Selector Cards */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Filter by Pricing Tier:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {priceTiers.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                selectedTier === tier.id
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">{tier.label}</span>
                {tier.id !== 'all' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-black bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                    INR
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{tier.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading premium materials...</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((item) => (
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
      ) : (
        <div className="py-20 text-center text-slate-400">
          No items found in this pricing tier.
        </div>
      )}

    </div>
  );
}
