import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../data/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ai-reads-super-secure-jwt-secret-key-2026';

// Middleware to authenticate token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role = 'student', college = '' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      passwordHash,
      role: role === 'admin' ? 'admin' : 'student',
      college: college || 'Computer Science Institute',
      semester: '1st Semester',
      joinedAt: new Date().toISOString()
    };

    db.addUser(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({ user: safeUser, token, message: 'Signup successful!' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check demo accounts fallback or bcrypt
    let isMatch = false;
    if (email === 'student@aireads.com' && password === 'password123') {
      isMatch = true;
    } else if (email === 'admin@aireads.com' && password === 'admin123') {
      isMatch = true;
    } else {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = user;
    return res.json({ user: safeUser, token, message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Google Login simulation
router.post('/google', async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Google email required' });
    }

    let user = db.findUserByEmail(email);
    if (!user) {
      user = {
        id: `user-google-${Date.now()}`,
        name: name || 'Google Learner',
        email,
        passwordHash: '',
        role: 'student',
        college: 'Global University',
        semester: 'Semester 1',
        joinedAt: new Date().toISOString()
      };
      db.addUser(user);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = user;
    return res.json({ user: safeUser, token, message: 'Google Sign-in successful' });
  } catch (err) {
    res.status(500).json({ error: 'Google login failed' });
  }
});

// Send OTP
const otpStore = new Map();
router.post('/send-otp', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  // Generate 6 digit code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email.toLowerCase(), { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

  console.log(`[AI Reads Auth] OTP for ${email}: ${otp}`);
  return res.json({
    message: `Verification code sent to ${email}`,
    devOtp: otp // Returned for easy instant testing in development
  });
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const entry = otpStore.get(email?.toLowerCase());

  if (!entry || entry.otp !== otp || entry.expiresAt < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired OTP code' });
  }

  otpStore.delete(email.toLowerCase());

  let user = db.findUserByEmail(email);
  if (!user) {
    user = {
      id: `user-otp-${Date.now()}`,
      name: email.split('@')[0],
      email,
      passwordHash: '',
      role: 'student',
      college: 'AI Reads University',
      semester: '2026',
      joinedAt: new Date().toISOString()
    };
    db.addUser(user);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { passwordHash: _, ...safeUser } = user;
  return res.json({ user: safeUser, token, message: 'OTP verified successfully' });
});

// Forgot Password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'No user registered with this email address' });
  }
  const resetToken = Math.random().toString(36).substring(2, 10).toUpperCase();
  return res.json({
    message: 'Password reset link and security code has been generated.',
    resetToken
  });
});

// Get Current User Profile
router.get('/me', authenticateToken, (req, res) => {
  const user = db.findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// Update Profile
router.put('/profile', authenticateToken, (req, res) => {
  const { name, college, semester } = req.body;
  const user = db.findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (name) user.name = name;
  if (college) user.college = college;
  if (semester) user.semester = semester;
  db.saveData();

  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser, message: 'Profile updated successfully' });
});

export default router;
