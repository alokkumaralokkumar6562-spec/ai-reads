import React, { useState, useEffect } from 'react';
import {
  Shield, Upload, Plus, Trash2, Edit, Star, CheckCircle,
  X, BarChart3, Users, BookOpen, ShoppingBag, DollarSign,
  Layers, Search, AlertCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboardPage() {
  const { user, token, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'books' | 'categories' | 'orders' | 'users'

  // Data
  const [analytics, setAnalytics] = useState(null);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload/Edit Book Modal
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    category: 'Artificial Intelligence',
    type: 'book',
    price: 99,
    pages: 150,
    language: 'English',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    description: '',
    featured: false
  });

  // Add Category Modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Load Admin Data
  const loadAdminData = () => {
    if (!token) return;
    setLoading(true);

    Promise.all([
      fetch('/api/admin/analytics', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/books').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/orders/all', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ])
      .then(([analyticsRes, booksRes, catsRes, ordersRes, usersRes]) => {
        setAnalytics(analyticsRes);
        setBooks(booksRes.books || []);
        setCategories(catsRes.categories || []);
        setOrders(ordersRes.orders || []);
        setUsersList(usersRes.users || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Admin fetch error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAdminData();
  }, [token]);

  // Create Book
  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('Item added successfully!');
      setBookModalOpen(false);
      loadAdminData();
    } catch (err) {
      alert('Error adding book: ' + err.message);
    }
  };

  // Delete Book
  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setBooks(prev => prev.filter(b => b.id !== id));
      }
    } catch (err) {
      alert('Failed to delete book');
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (book) => {
    try {
      const newFeatured = !book.featured;
      const res = await fetch(`/api/admin/featured/${book.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ featured: newFeatured })
      });
      if (res.ok) {
        setBooks(prev => prev.map(b => b.id === book.id ? { ...b, featured: newFeatured } : b));
      }
    } catch (err) {
      alert('Error updating featured status');
    }
  };

  // Create Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: catName, description: catDesc })
      });
      const data = await res.json();
      if (res.ok) {
        setCatModalOpen(false);
        setCatName('');
        setCatDesc('');
        loadAdminData();
      }
    } catch (err) {
      alert('Error adding category');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center space-y-4 px-4">
        <Shield className="w-16 h-16 text-amber-500 mx-auto" />
        <h2 className="text-2xl font-black">Admin Access Required</h2>
        <p className="text-xs text-slate-500">
          You are currently signed in as a student. To test the Admin Dashboard, use the one-click role switcher in the top-right navigation menu to switch to <strong>Admin</strong>.
        </p>
      </div>
    );
  }

  const metrics = analytics?.metrics || {
    totalRevenue: 298,
    totalOrders: 2,
    totalBooks: books.length,
    totalUsers: usersList.length,
    totalDownloads: 45000,
    totalReads: 120000
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
            <Shield className="w-4 h-4" /> Administration Center
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Platform Management Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage books, categories, pricing, student orders, revenue, and platform catalog.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setBookModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Upload New Book/Notes
          </button>
          <button
            onClick={() => setCatModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all"
          >
            Add Category
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Analytics & Revenue', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'books', label: `Manage Books (${books.length})`, icon: <BookOpen className="w-4 h-4" /> },
          { id: 'categories', label: `Categories (${categories.length})`, icon: <Layers className="w-4 h-4" /> },
          { id: 'orders', label: `Orders & Payments (${orders.length})`, icon: <ShoppingBag className="w-4 h-4" /> },
          { id: 'users', label: `Registered Users (${usersList.length})`, icon: <Users className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Revenue</p>
              <p className="text-xl font-black text-emerald-600 mt-1">₹{metrics.totalRevenue}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Razorpay Verified</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Paid Orders</p>
              <p className="text-xl font-black text-indigo-600 mt-1">{orders.length}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Transactions</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Published Items</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{books.length}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Books & Notes</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Registered Users</p>
              <p className="text-xl font-black text-purple-600 mt-1">{usersList.length}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Active Learners</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Downloads</p>
              <p className="text-xl font-black text-blue-600 mt-1">{metrics.totalDownloads.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">PDFs Downloaded</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Online Reads</p>
              <p className="text-xl font-black text-amber-500 mt-1">{metrics.totalReads.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Reader Sessions</p>
            </div>
          </div>

          {/* Quick Orders List */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Recent Transactions</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {orders.slice(0, 5).map(o => (
                <div key={o.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{o.bookTitle}</p>
                    <p className="text-[11px] text-slate-400">By {o.userName} ({o.userEmail}) • {new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="font-bold text-indigo-600">₹{o.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. BOOKS & NOTES MANAGEMENT */}
      {activeTab === 'books' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-5">Item</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Price</th>
                  <th className="py-3 px-5">Featured</th>
                  <th className="py-3 px-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {books.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-5 flex items-center gap-3">
                      <img src={b.coverImage} alt={b.title} className="w-9 h-12 object-cover rounded shadow-sm shrink-0" />
                      <div className="min-w-0 max-w-[200px]">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{b.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{b.author}</p>
                      </div>
                    </td>
                    <td className="py-3 px-5">{b.category}</td>
                    <td className="py-3 px-5 capitalize">{b.type}</td>
                    <td className="py-3 px-5 font-bold">
                      {b.isFree ? <span className="text-emerald-600">Free</span> : `₹${b.price}`}
                    </td>
                    <td className="py-3 px-5">
                      <button
                        onClick={() => handleToggleFeatured(b)}
                        className={`p-1.5 rounded-lg transition-colors ${b.featured ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`}
                        title="Toggle Featured on Homepage"
                      >
                        <Star className="w-4 h-4" fill={b.featured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="py-3 px-5">
                      <button
                        onClick={() => handleDeleteBook(b.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                        title="Delete Book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{cat.count}+ Items</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{cat.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{cat.description}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 flex justify-between text-[11px]">
                <span className="text-slate-400">ID: {cat.id}</span>
                <span className="text-emerald-600 font-semibold">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-5">Order ID</th>
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-5">Book / Note</th>
                  <th className="py-3 px-5">Amount</th>
                  <th className="py-3 px-5">Razorpay ID</th>
                  <th className="py-3 px-5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-5 font-mono text-[11px] font-semibold">{o.id}</td>
                    <td className="py-3 px-5">
                      <p className="font-semibold text-slate-900 dark:text-white">{o.userName}</p>
                      <p className="text-[10px] text-slate-400">{o.userEmail}</p>
                    </td>
                    <td className="py-3 px-5 max-w-[200px] truncate">{o.bookTitle}</td>
                    <td className="py-3 px-5 font-bold text-indigo-600">₹{o.amount}</td>
                    <td className="py-3 px-5 font-mono text-[10px] text-slate-400">{o.razorpayPaymentId}</td>
                    <td className="py-3 px-5 text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-5">User</th>
                  <th className="py-3 px-5">Role</th>
                  <th className="py-3 px-5">College</th>
                  <th className="py-3 px-5">Orders</th>
                  <th className="py-3 px-5">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-5">
                      <p className="font-semibold text-slate-900 dark:text-white">{u.name}</p>
                      <p className="text-[10px] text-slate-400">{u.email}</p>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-5">{u.college || 'N/A'}</td>
                    <td className="py-3 px-5 font-bold">{u.ordersCount || 0}</td>
                    <td className="py-3 px-5 text-slate-400">{new Date(u.joinedAt || Date.now()).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* UPLOAD BOOK MODAL */}
      {bookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Publish New Book or Notes</h3>
              <button onClick={() => setBookModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  placeholder="e.g. Distributed Operating Systems"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Author</label>
                  <input
                    type="text"
                    required
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    placeholder="e.g. Prof. Tanenbaum"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Type</label>
                  <select
                    value={bookForm.type}
                    onChange={(e) => setBookForm({ ...bookForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    <option value="book">Textbook</option>
                    <option value="notes">Handwritten Notes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={bookForm.category}
                  onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                >
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Price (₹0 for Free, or ₹49, ₹99, ₹149, ₹199)</label>
                  <input
                    type="number"
                    min="0"
                    value={bookForm.price}
                    onChange={(e) => setBookForm({ ...bookForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none font-bold text-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Pages</label>
                  <input
                    type="number"
                    value={bookForm.pages}
                    onChange={(e) => setBookForm({ ...bookForm, pages: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={bookForm.coverImage}
                  onChange={(e) => setBookForm({ ...bookForm, coverImage: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  placeholder="Summary of chapters and topics covered..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-semibold pt-1">
                <input
                  type="checkbox"
                  checked={bookForm.featured}
                  onChange={(e) => setBookForm({ ...bookForm, featured: e.target.checked })}
                  className="accent-indigo-600"
                />
                <span>Feature on Homepage Spotlight</span>
              </label>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md mt-2"
              >
                Publish Book / Notes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Add Academic Category</h3>
              <button onClick={() => setCatModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Cloud Computing & DevOps"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="e.g. Kubernetes, Docker, AWS architecture"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md mt-2"
              >
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
