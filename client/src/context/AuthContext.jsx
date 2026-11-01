import React, { createContext, useContext, useState, useEffect } from 'react';

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
    return localStorage.getItem('aireads-token') || 'demo-auth-token-student';
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('login'); // 'login' | 'signup' | 'otp' | 'forgot'

  useEffect(() => {
    if (user) {
      localStorage.setItem('aireads-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aireads-user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('aireads-token', token);
    } else {
      localStorage.removeItem('aireads-token');
    }
  }, [token]);

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
    localStorage.removeItem('aireads-user');
    localStorage.removeItem('aireads-token');
  };

  // One-click quick demo switcher
  const quickSwitchUser = (role) => {
    if (role === 'admin') {
      setUser({
        id: 'user-admin-1',
        name: 'Alok Kumar',
        email: 'admin@aireads.com',
        role: 'admin'
      });
      setToken('demo-auth-token-admin');
    } else {
      setUser({
        id: 'user-student-1',
        name: 'Alex Sharma',
        email: 'student@aireads.com',
        role: 'student',
        college: 'Delhi Technological University',
        semester: '6th Semester'
      });
      setToken('demo-auth-token-student');
    }
  };

  const openAuthModal = (view = 'login') => {
    setAuthModalView(view);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
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
