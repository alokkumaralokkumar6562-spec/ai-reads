import express from 'express';
import { db } from '../data/db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin credentials required' });
  }
  next();
};

// GET /api/admin/analytics - Overview metrics
router.get('/analytics', authenticateToken, requireAdmin, (req, res) => {
  const books = db.getBooks();
  const orders = db.getOrders();
  const users = db.getUsers();
  const categories = db.getCategories();

  const totalRevenue = orders
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const totalDownloads = books.reduce((sum, b) => sum + (b.downloadsCount || 0), 0);
  const totalReads = books.reduce((sum, b) => sum + (b.readsCount || 0), 0);
  const paidBooksCount = books.filter(b => !b.isFree).length;
  const freeBooksCount = books.filter(b => b.isFree).length;

  res.json({
    metrics: {
      totalRevenue,
      totalOrders: orders.length,
      totalBooks: books.length,
      paidBooksCount,
      freeBooksCount,
      totalUsers: users.length,
      totalCategories: categories.length,
      totalDownloads,
      totalReads
    },
    recentOrders: orders.slice(0, 8),
    recentUsers: users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, college: u.college, joinedAt: u.joinedAt })).slice(0, 8)
  });
});

// GET /api/admin/users - list all users
router.get('/users', authenticateToken, requireAdmin, (req, res) => {
  const users = db.getUsers().map(u => {
    const { passwordHash: _, ...safeUser } = u;
    const userOrders = db.getUserOrders(u.id);
    const userLibrary = db.getUserLibrary(u.id);
    return {
      ...safeUser,
      ordersCount: userOrders.length,
      libraryCount: userLibrary.length
    };
  });
  res.json({ users });
});

// PUT /api/admin/featured/:id - toggle featured item status
router.put('/featured/:id', authenticateToken, requireAdmin, (req, res) => {
  const { featured } = req.body;
  const book = db.getBookById(req.params.id);
  if (!book) return res.status(404).json({ error: 'Item not found' });

  book.featured = Boolean(featured);
  db.saveData();
  res.json({ book, message: `Item featured status updated to ${book.featured}` });
});

export default router;
