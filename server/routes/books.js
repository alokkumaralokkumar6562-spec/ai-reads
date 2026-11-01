import express from 'express';
import { db } from '../data/db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin credentials required' });
  }
  next();
};

// GET /api/books - with full search, filter and pagination/sorting
router.get('/', (req, res) => {
  let books = db.getBooks();
  const { category, type, isFree, price, search, sort, featured } = req.query;

  if (category && category !== 'All') {
    books = books.filter(b => b.category.toLowerCase() === category.toLowerCase());
  }

  if (type && type !== 'all') {
    books = books.filter(b => b.type === type);
  }

  if (isFree !== undefined && isFree !== '') {
    const isFreeBool = isFree === 'true';
    books = books.filter(b => b.isFree === isFreeBool);
  }

  if (price && price !== 'all') {
    const numPrice = parseInt(price, 10);
    if (!isNaN(numPrice)) {
      books = books.filter(b => b.price === numPrice);
    }
  }

  if (featured === 'true') {
    books = books.filter(b => b.featured);
  }

  if (search && search.trim() !== '') {
    const term = search.toLowerCase().trim();
    books = books.filter(b =>
      b.title.toLowerCase().includes(term) ||
      b.author.toLowerCase().includes(term) ||
      b.category.toLowerCase().includes(term) ||
      b.description.toLowerCase().includes(term)
    );
  }

  // Sorting
  if (sort === 'price_asc') {
    books.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    books.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    books.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'popular') {
    books.sort((a, b) => b.readsCount - a.readsCount);
  } else if (sort === 'downloads') {
    books.sort((a, b) => b.downloadsCount - a.downloadsCount);
  }

  res.json({
    total: books.length,
    books
  });
});

// GET /api/books/:id - single book
router.get('/:id', (req, res) => {
  const book = db.getBookById(req.params.id);
  if (!book) {
    return res.status(404).json({ error: 'Book or Note not found' });
  }

  // Also include related items from same category
  const related = db.getBooks()
    .filter(b => b.category === book.category && b.id !== book.id)
    .slice(0, 4);

  res.json({ book, related });
});

// POST /api/books - create new book (admin only)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const {
      title,
      author,
      category,
      type = 'book',
      price = 0,
      pages = 100,
      language = 'English',
      coverImage,
      description,
      tableOfContents = [],
      samplePdfUrl,
      featured = false
    } = req.body;

    if (!title || !author || !category) {
      return res.status(400).json({ error: 'Title, Author, and Category are required' });
    }

    const numPrice = Number(price);
    const newBook = {
      id: `item-${Date.now()}`,
      title,
      author,
      category,
      type,
      price: numPrice,
      isFree: numPrice === 0,
      rating: 5.0,
      reviewsCount: 1,
      pages: Number(pages) || 120,
      language,
      featured: Boolean(featured),
      coverImage: coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      description: description || 'Educational resource uploaded via AI Reads Admin.',
      tableOfContents: Array.isArray(tableOfContents) ? tableOfContents : [
        'Chapter 1: Foundations & Core Principles',
        'Chapter 2: In-Depth Exploration',
        'Chapter 3: Exercises and Practical Solutions'
      ],
      samplePdfUrl: samplePdfUrl || '/samples/demo-sample.pdf',
      downloadsCount: 0,
      readsCount: 0,
      createdAt: new Date().toISOString()
    };

    db.addBook(newBook);
    res.status(201).json({ book: newBook, message: 'Item published successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT /api/books/:id - update book (admin only)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.price !== undefined) {
      updates.price = Number(updates.price);
      updates.isFree = updates.price === 0;
    }
    const updated = db.updateBook(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ book: updated, message: 'Item updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/books/:id - delete book (admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const success = db.deleteBook(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json({ message: 'Item deleted successfully' });
});

export default router;
