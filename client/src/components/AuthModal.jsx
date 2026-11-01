import React, { useState } from 'react';
import {
  X, Mail, Lock, User, GraduationCap, ArrowRight,
  Shield, CheckCircle2, AlertCircle, KeyRound, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const {
    authModalOpen,
    authModalView,
    closeAuthModal,
    setAuthModalView,
    login,
    signup,
    googleLogin,
    sendOtp,
    verifyOtp,
    forgotPassword,
    quickSwitchUser
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [role, setRole] = useState('student');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  if (!authModalOpen) return null;

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setError(res.error);
    }
  };

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signup({ name, email, password, role, college });
    setLoading(false);
    if (!res.success) {
      setError(res.error);
    }
  };

  // Handle Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    setError('');
    const res = await sendOtp(email);
    setLoading(false);
    if (res.success) {
      setInfoMessage(`Verification code sent! (Dev Test OTP: ${res.devOtp || '123456'})`);
      setAuthModalView('otp');
    } else {
      setError(res.error);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await verifyOtp(email, otp);
    setLoading(false);
    if (!res.success) {
      setError(res.error);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email');
      return;
    }
    setLoading(true);
    setError('');
    const res = await forgotPassword(email);
    setLoading(false);
    if (res.success) {
      setInfoMessage(`Password reset code generated: ${res.resetToken}. Check console/dev alerts.`);
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {authModalView === 'login' && 'Welcome Back'}
              {authModalView === 'signup' && 'Create Your Account'}
              {authModalView === 'otp' && 'Verify Email OTP'}
              {authModalView === 'forgot' && 'Reset Password'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI Reads • Smart Study Platform
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">

          {/* Quick Demo Fillers Bar */}
          <div className="mb-5 p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Instant Test Accounts:
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  quickSwitchUser('student');
                  closeAuthModal();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold text-slate-800 dark:text-slate-200 hover:bg-indigo-50 text-left transition-colors"
              >
                🎓 <strong>Student</strong> (Alex Sharma)
              </button>
              <button
                type="button"
                onClick={() => {
                  quickSwitchUser('admin');
                  closeAuthModal();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold text-slate-800 dark:text-slate-200 hover:bg-amber-50 text-left transition-colors"
              >
                🛡️ <strong>Admin</strong> (Manager)
              </button>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* 1. LOGIN VIEW */}
          {authModalView === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@aireads.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthModalView('forgot')}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400"><span className="bg-white dark:bg-slate-900 px-2">Or continue with</span></div>
              </div>

              {/* Social Login & OTP */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => googleLogin({ email: email || 'student@aireads.com', name: 'Google Student' })}
                  className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Google
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <KeyRound className="w-4 h-4 text-indigo-500" />
                  Email OTP
                </button>
              </div>

              <p className="text-center text-xs text-slate-500 pt-2">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthModalView('signup')}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Sign Up Free
                </button>
              </p>
            </form>
          )}

          {/* 2. SIGNUP VIEW */}
          {authModalView === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Patel"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@college.edu"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  College / University
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. IIT Delhi / DTU / Anna Univ"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <p className="text-center text-xs text-slate-500 pt-2">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setAuthModalView('login')}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </form>
          )}

          {/* 3. OTP VIEW */}
          {authModalView === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Enter the 6-digit verification code sent to <strong>{email}</strong>.
              </p>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  required
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>

              <div className="flex justify-between items-center text-xs pt-2">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Resend OTP Code
                </button>
                <button
                  type="button"
                  onClick={() => setAuthModalView('login')}
                  className="text-slate-500 hover:underline"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

          {/* 4. FORGOT PASSWORD VIEW */}
          {authModalView === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Enter your registered email and we'll send you an instant reset link and recovery code.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@aireads.com"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {loading ? 'Generating Link...' : 'Send Recovery Link'}
              </button>

              <button
                type="button"
                onClick={() => setAuthModalView('login')}
                className="w-full text-center text-xs text-indigo-600 dark:text-indigo-400 hover:underline pt-2 block"
              >
                Return to Login
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
