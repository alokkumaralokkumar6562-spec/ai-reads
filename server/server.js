import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import booksRoutes from './routes/books.js';
import categoriesRoutes from './routes/categories.js';
import ordersRoutes from './routes/orders.js';
import libraryRoutes from './routes/library.js';
import aiRoutes from './routes/ai.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'AI Reads',
    tagline: 'Read Smarter. Learn Faster. Grow Better.',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Serve built frontend if dist folder exists
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`📦 Serving production frontend build from ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Reads Backend Server running on http://localhost:${PORT}`);
  console.log(`📚 Ready to serve notes, books, and AI study tools`);
});
