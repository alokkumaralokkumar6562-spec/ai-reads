import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthExpired, clearAuthStorage, authAPI } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('aireads-user');
      if (savedUser) return JSON.parse(savedUser);
      // Default to Demo Student for immediate friction-free exploration
      return {
        id: 'user-student-1',
        name: 'Alex Sharma',
        email: 'student@aireads.com',
        role: 'student',
        college: 'Delhi Technological University',
        semester: '6th Semester'
      };
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('aireads-token') || null;
    } catch (e) {
      return null;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('login'); // 'login' | 'signup' | 'otp' | 'forgot'
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState('');

  // Persist user in localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('aireads-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aireads-user');
    }
  }, [user]);

  // Persist token in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('aireads-token', token);
    } else {
      localStorage.removeItem('aireads-token');
    }
  }, [token]);

  // Graceful session expiry handler - intercepts 401/403 and prompts login
  useEffect(() => {
    const unsubscribe = onAuthExpired((details) => {
      setUser(null);
      setToken(null);
      setSessionExpiredNotice(details?.error || 'Your session has expired. Please log in again to continue.');
      setAuthModalView('login');
      setAuthModalOpen(true);
    });

    return () => unsubscribe();
  }, []);

  // Ensure initial user has a valid signed JWT (replaces legacy raw placeholder strings)
  useEffect(() => {
    const ensureValidJwt = async () => {
      const storedToken = localStorage.getItem('aireads-token');
      // If token is missing or is legacy unsigned demo string, fetch a cryptographically signed token
      if (!storedToken || storedToken.startsWith('demo-auth-token')) {
        try {
          const role = user?.role || 'student';
          const res = await fetch(`/api/auth/demo-token?role=${role}`);
          if (res.ok) {
            const data = await res.json();
            if (data.token) {
              setToken(data.token);
              if (data.user) setUser(data.user);
            }
          }
        } catch (e) {
          console.warn('[AuthContext] Could not fetch signed initial demo token:', e.message);
        }
      }
    };

    ensureValidJwt();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setUser(data.user);
      setToken(data.token);
      setSessionExpiredNotice('');
      setAuthModalOpen(false);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Sign up
  const signup = async ({ name, email, password, role = 'student', college }) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, college })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      setUser(data.user);
      setToken(data.token);
      setSessionExpiredNotice('');
      setAuthModalOpen(false);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Google Login
  const googleLogin = async ({ email = 'alex.sharma@gmail.com', name = 'Alex Sharma' }) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed');

      setUser(data.user);
      setToken(data.token);
      setSessionExpiredNotice('');
      setAuthModalOpen(false);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Send OTP
  const sendOtp = async (email) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      return { success: true, message: data.message, devOtp: data.devOtp };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Verify OTP
  const verifyOtp = async (email, otp) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');

      setUser(data.user);
      setToken(data.token);
      setSessionExpiredNotice('');
      setAuthModalOpen(false);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset email');
      return { success: true, message: data.message, resetToken: data.resetToken };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    clearAuthStorage();
  };

  // One-click quick demo switcher with signed JWT minting
  const quickSwitchUser = async (role) => {
    try {
      const res = await fetch(`/api/auth/demo-token?role=${role}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        return;
      }
    } catch (e) {
      console.warn('Fallback local demo switch:', e);
    }

    if (role === 'admin') {
      setUser({
        id: 'user-admin-1',
        name: 'Alok Kumar',
        email: 'admin@aireads.com',
        role: 'admin'
      });
    } else {
      setUser({
        id: 'user-student-1',
        name: 'Alex Sharma',
        email: 'student@aireads.com',
        role: 'student',
        college: 'Delhi Technological University',
        semester: '6th Semester'
      });
    }
  };

  const openAuthModal = (view = 'login') => {
    setAuthModalView(view);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setSessionExpiredNotice('');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        googleLogin,
        sendOtp,
        verifyOtp,
        forgotPassword,
        logout,
        quickSwitchUser,
        authModalOpen,
        authModalView,
        sessionExpiredNotice,
        openAuthModal,
        closeAuthModal,
        setAuthModalView
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
