import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Filter, SlidersHorizontal, Grid, List,
  X, Sparkles, BookOpen, ChevronDown
} from 'lucide-react';
import BookCard from '../components/BookCard';

export default function AllBooksPage({ onOpenReader, onOpenPayment, onToggleSave, savedBookIds, purchasedBookIds }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedPrice, setSelectedPrice] = useState(searchParams.get('price') || 'all');
  const [selectedType, setSelectedType] = useState('book'); // Default to books for this page
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
    if (selectedPrice && selectedPrice !== 'all') params.append('price', selectedPrice);
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (sortBy) params.append('sort', sortBy);

    fetch(`/api/books?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setBooks(data.books || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedCategory, selectedPrice, searchQuery, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedPrice('all');
    setSearchQuery('');
    setSortBy('popular');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
            <BookOpen className="w-4 h-4" /> Academic Store
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            All Books & Standard Textbooks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse comprehensive engineering & computer science textbooks across all 16 domains.
          </p>
        </div>

        {/* View Toggle & Count */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs font-semibold text-slate-500">
            Showing {books.length} items
          </span>
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl p-1 bg-white dark:bg-slate-900">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400' : 'text-slate-400'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400' : 'text-slate-400'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold flex items-center gap-1.5"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

        {/* Filter Sidebar */}
        <div className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} space-y-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24`}>

          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-indigo-500" /> Filter Books
            </h3>
            <button
              onClick={clearFilters}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Reset All
            </button>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Search Catalog</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Title, author, keyword..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
            >
              <option value="popular">Most Popular & Reads</option>
              <option value="rating">Highest Rated (4.8+)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="downloads">Most Downloaded</option>
            </select>
          </div>

          {/* Price Filters */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Pricing Options</label>
            <div className="space-y-1.5 text-xs">
              {[
                { label: 'All Prices', val: 'all' },
                { label: '100% Free', val: '0' },
                { label: '₹49 Tier', val: '49' },
                { label: '₹99 Tier', val: '99' },
                { label: '₹149 Tier', val: '149' },
                { label: '₹199 Tier', val: '199' }
              ].map(opt => (
                <label key={opt.val} className="flex items-center gap-2 cursor-pointer hover:text-indigo-600">
                  <input
                    type="radio"
                    name="priceFilter"
                    checked={selectedPrice === opt.val}
                    onChange={() => setSelectedPrice(opt.val)}
                    className="accent-indigo-600"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 16 Categories */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Subject / Category</label>
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1 text-xs">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                All Categories ({categories.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors flex justify-between items-center ${
                    selectedCategory === cat.name
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate max-w-[170px]">{cat.name}</span>
                  <span className="text-[10px] text-slate-400">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Books Catalog Grid */}
        <div className="lg:col-span-3 space-y-6">

          {/* Active Filter Chips */}
          {(selectedCategory !== 'All' || selectedPrice !== 'all' || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Applied:</span>
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedPrice !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Price: {selectedPrice === '0' ? 'Free' : `₹${selectedPrice}`}
                  <button onClick={() => setSelectedPrice('all')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Loading or Books */}
          {loading ? (
            <div className="py-20 text-center text-slate-400">Loading catalog...</div>
          ) : books.length > 0 ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
              {books.map((book) => (
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
          ) : (
            <div className="py-20 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No Books Found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No items matched your current filter criteria. Try resetting filters or searching another keyword.
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow"
              >
                Reset Filters
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
