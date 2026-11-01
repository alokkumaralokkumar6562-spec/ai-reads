import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen, Sparkles, Sun, Moon, User, LogOut,
  Menu, X, Search, Shield, ChevronDown, CheckCircle2,
  FolderHeart, ShoppingBag, FileText, Gift
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onOpenSearch }) {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal, quickSwitchUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'All Books', path: '/books' },
    { name: 'All Notes', path: '/notes' },
    { name: 'Free Materials', path: '/free', highlight: true },
    { name: 'Paid Materials', path: '/paid' },
    { name: 'AI Study Assistant', path: '/ai-assistant', isAi: true },
    { name: 'My Library', path: '/library' },
    { name: 'Dashboard', path: '/dashboard' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  AI Reads
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block -mt-1 font-medium">
                Read Smarter • Learn Faster
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                    active
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                  } ${link.isAi ? 'text-purple-600 dark:text-purple-400 font-semibold' : ''}`}
                >
                  {link.isAi && <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />}
                  {link.name}
                  {link.highlight && (
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Quick Search trigger */}
            <button
              onClick={() => onOpenSearch && onOpenSearch()}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Search books and notes (Ctrl+K)"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* User Profile or Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1 px-2 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden md:block text-xs leading-tight pr-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                      {user?.name?.split(' ')[0]}
                    </p>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isAdmin ? 'text-amber-500' : 'text-indigo-500'}`}>
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Verified Learner
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Student Dashboard
                      </Link>
                      <Link
                        to="/library"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <FolderHeart className="w-4 h-4 text-slate-400" />
                        My Library
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                        My Orders & Invoices
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                        >
                          <Shield className="w-4 h-4 text-amber-500" />
                          Admin Dashboard
                        </Link>
                      )}
                    </div>

                    {/* Quick Demo Role Switcher */}
                    <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px]">
                      <p className="text-slate-400 mb-1.5 font-medium">Quick Demo Role Switch:</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            quickSwitchUser('student');
                            setUserDropdownOpen(false);
                          }}
                          className={`px-2 py-1 rounded text-center font-medium border text-[11px] ${
                            user?.role === 'student'
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          Student
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            quickSwitchUser('admin');
                            setUserDropdownOpen(false);
                          }}
                          className={`px-2 py-1 rounded text-center font-medium border text-[11px] ${
                            user?.role === 'admin'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          Admin
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                isActive(link.path)
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {link.isAi && <Sparkles className="w-4 h-4 text-purple-500" />}
                {link.name}
              </div>
              {link.highlight && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  FREE
                </span>
              )}
            </Link>
          ))}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40"
            >
              <Shield className="w-4 h-4" />
              Admin Dashboard
            </Link>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Role Switch:</span>
            <div className="flex gap-2">
              <button
                onClick={() => quickSwitchUser('student')}
                className={`px-3 py-1 rounded-md text-xs font-semibold ${user?.role === 'student' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
              >
                Student
              </button>
              <button
                onClick={() => quickSwitchUser('admin')}
                className={`px-3 py-1 rounded-md text-xs font-semibold ${user?.role === 'admin' ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
