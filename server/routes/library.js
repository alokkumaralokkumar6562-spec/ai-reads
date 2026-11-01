import express from 'express';
import { db } from '../data/db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// GET /api/library - full user library with joined book details
router.get('/', authenticateToken, (req, res) => {
  const libraryEntries = db.getUserLibrary(req.user.id);
  const allBooks = db.getBooks();

  const enriched = libraryEntries.map(entry => {
    const book = allBooks.find(b => b.id === entry.bookId);
    return {
      ...entry,
      book: book || { title: 'Unknown Material', author: 'Unknown', coverImage: '', category: 'General' }
    };
  });

  res.json({ library: enriched });
});

// POST /api/library/save - toggle save item
router.post('/save', authenticateToken, (req, res) => {
  const { bookId } = req.body;
  const book = db.getBookById(bookId);
  if (!book) return res.status(404).json({ error: 'Item not found' });

  const entries = db.getUserLibrary(req.user.id);
  const existing = entries.find(e => e.bookId === bookId);

  if (existing) {
    existing.isSaved = !existing.isSaved;
    db.saveData();
    return res.json({ saved: existing.isSaved, message: existing.isSaved ? 'Saved to library' : 'Removed from saved' });
  } else {
    db.addToLibrary({
      userId: req.user.id,
      bookId,
      progress: 0,
      lastReadPage: 1,
      lastReadAt: new Date().toISOString(),
      isPurchased: false,
      isSaved: true
    });
    return res.json({ saved: true, message: 'Saved to library' });
  }
});

// POST /api/library/progress - update progress
router.post('/progress', authenticateToken, (req, res) => {
  const { bookId, progress, lastReadPage } = req.body;
  if (!bookId) return res.status(400).json({ error: 'bookId is required' });

  const updated = db.updateLibraryProgress(
    req.user.id,
    bookId,
    Math.min(100, Math.max(0, Number(progress) || 0)),
    Number(lastReadPage) || 1
  );

  res.json({ progress: updated });
});

// GET /api/library/dashboard-summary - student dashboard aggregate
router.get('/dashboard-summary', authenticateToken, (req, res) => {
  const libraryEntries = db.getUserLibrary(req.user.id);
  const allBooks = db.getBooks();
  const allOrders = db.getUserOrders(req.user.id);
  const aiHistory = db.getUserAIHistory(req.user.id);

  // Enriched items
  const items = libraryEntries.map(entry => {
    const book = allBooks.find(b => b.id === entry.bookId);
    return {
      ...entry,
      book: book || { title: 'Study Material', author: 'AI Reads' }
    };
  });

  const recentlyRead = [...items].sort((a, b) => new Date(b.lastReadAt) - new Date(a.lastReadAt)).slice(0, 4);
  const purchasedNotes = items.filter(i => i.isPurchased);
  const savedBooks = items.filter(i => i.isSaved);

  // Recommendations: top rated items not yet in user library
  const userBookIds = new Set(libraryEntries.map(e => e.bookId));
  const recommendations = allBooks
    .filter(b => !userBookIds.has(b.id))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  // Compute stats
  const totalReadCount = libraryEntries.length;
  const avgProgress = libraryEntries.length > 0
    ? Math.round(libraryEntries.reduce((sum, e) => sum + (e.progress || 0), 0) / libraryEntries.length)
    : 0;

  res.json({
    stats: {
      totalLibraryItems: totalReadCount,
      purchasedCount: purchasedNotes.length,
      averageProgress: avgProgress,
      totalOrdersCount: allOrders.length,
      aiInteractionsCount: aiHistory.length
    },
    recentlyRead,
    purchasedNotes,
    savedBooks,
    orders: allOrders.slice(0, 5),
    aiHistory: aiHistory.slice(0, 6),
    recommendations
  });
});

export default router;
