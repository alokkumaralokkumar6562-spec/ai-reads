import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Download, Eye, Bookmark, Sparkles, BookOpen, Check } from 'lucide-react';

export default function BookCard({ book, onPreview, onBuy, onToggleSave, isSaved, isPurchased }) {
  const {
    id,
    title,
    author,
    category,
    type,
    price,
    isFree,
    rating = 4.9,
    reviewsCount = 120,
    pages = 120,
    coverImage,
    description
  } = book;

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">

      {/* Top badges */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
        {isFree ? (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
            FREE
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            ₹{price}
          </span>
        )}

        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/70 text-white backdrop-blur-md">
          {type === 'notes' ? 'Notes' : 'Book'}
        </span>
      </div>

      {/* Save / Bookmark Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleSave && onToggleSave(id);
        }}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all ${
          isSaved
            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
            : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400'
        }`}
        title={isSaved ? 'Saved in library' : 'Save to library'}
      >
        <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
      </button>

      {/* Cover Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <button
            onClick={() => onPreview && onPreview(book)}
            className="w-full py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-center gap-1.5 shadow-lg backdrop-blur-sm hover:bg-white transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-500" />
            Quick Read Preview
          </button>
        </div>
      </div>

      {/* Book Metadata */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-[150px]">
              {category}
            </span>
            <span>{pages} Pages</span>
          </div>

          <Link to={`/book/${id}`} className="block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2 mb-1">
              {title}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">
            By <span className="font-medium text-slate-700 dark:text-slate-300">{author}</span>
          </p>

          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Rating and Call to action */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-800 dark:text-slate-200">{rating}</span>
            <span className="text-slate-400 text-[10px]">({reviewsCount})</span>
          </div>

          {/* Action button */}
          <div>
            {isPurchased ? (
              <button
                onClick={() => onPreview && onPreview(book)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1 hover:bg-emerald-100 transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Read Online
              </button>
            ) : isFree ? (
              <button
                onClick={() => onPreview && onPreview(book)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02]"
              >
                <Download className="w-3.5 h-3.5" /> Free Read
              </button>
            ) : (
              <button
                onClick={() => onBuy && onBuy(book)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 transition-all hover:scale-[1.02]"
              >
                Buy ₹{price}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
