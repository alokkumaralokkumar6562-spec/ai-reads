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

// GET /api/categories
router.get('/', (req, res) => {
  const categories = db.getCategories();
  const books = db.getBooks();

  // Dynamic count calculation
  const enriched = categories.map(cat => {
    const matchingCount = books.filter(b => b.category.toLowerCase() === cat.name.toLowerCase()).length;
    return {
      ...cat,
      count: Math.max(cat.count || 0, matchingCount)
    };
  });

  res.json({ categories: enriched });
});

// POST /api/categories (admin)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const { name, icon = 'BookOpen', description = '' } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const newCat = {
    id: `cat-${Date.now()}`,
    name,
    icon,
    count: 0,
    description
  };

  db.addCategory(newCat);
  res.status(201).json({ category: newCat, message: 'Category added successfully' });
});

// PUT /api/categories/:id (admin)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.json({ category: updated, message: 'Category updated successfully' });
});

// DELETE /api/categories/:id (admin)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const success = db.deleteCategory(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.json({ message: 'Category deleted successfully' });
});

export default router;
