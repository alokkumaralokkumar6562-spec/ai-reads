import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { db } from '../data/db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';

let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('[AI Reads] Live Razorpay instance initialized');
  } catch (e) {
    console.warn('[AI Reads] Razorpay initialization failed, running in simulated sandbox mode:', e.message);
  }
}

// GET /api/orders/config - returns Razorpay Key ID for client checkout
router.get('/config', (req, res) => {
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_simulated_key',
    isLiveConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  });
});

// POST /api/orders/create - create a new order
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = db.getBookById(bookId);

    if (!book) {
      return res.status(404).json({ error: 'Book or Note not found' });
    }

    if (book.isFree || book.price === 0) {
      return res.status(400).json({ error: 'This item is free. Use unlock-free instead.' });
    }

    const amountInPaise = Math.round(book.price * 100);
    const receipt = `rcpt_${Date.now()}`;

    // If real Razorpay keys are configured
    if (razorpayInstance) {
      try {
        const options = {
          amount: amountInPaise,
          currency: 'INR',
          receipt,
          notes: {
            bookId: book.id,
            bookTitle: book.title,
            userId: req.user.id,
            userEmail: req.user.email
          }
        };
        const order = await razorpayInstance.orders.create(options);
        return res.json({
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          book
        });
      } catch (rzpErr) {
        console.error('Razorpay API error, falling back to mock order:', rzpErr);
      }
    }

    // Simulated sandbox order
    const mockOrderId = `order_${Math.random().toString(36).substring(2, 12)}`;
    return res.json({
      orderId: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      book,
      sandbox: true,
      message: 'Sandbox test mode active'
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// POST /api/orders/verify - verify payment and unlock item
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookId
    } = req.body;

    const book = db.getBookById(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    let isValid = false;

    // Verify cryptographic signature if secret configured
    if (process.env.RAZORPAY_KEY_SECRET && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isValid = generatedSignature === razorpay_signature;
    } else {
      // In sandbox mode without keys, approve mock transactions
      isValid = Boolean(razorpay_order_id);
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature. Verification failed.'
      });
    }

    // Record order in db
    const newOrder = {
      id: `ord_${Date.now()}`,
      userId: req.user.id,
      userName: req.user.name || 'Student Learner',
      userEmail: req.user.email,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      amount: book.price,
      currency: 'INR',
      razorpayOrderId: razorpay_order_id || `order_manual_${Date.now()}`,
      razorpayPaymentId: razorpay_payment_id || `pay_manual_${Date.now()}`,
      status: 'paid',
      createdAt: new Date().toISOString()
    };

    db.addOrder(newOrder);

    // Automatically unlock item into student's library
    db.addToLibrary({
      userId: req.user.id,
      bookId: book.id,
      progress: 0,
      lastReadPage: 1,
      lastReadAt: new Date().toISOString(),
      isPurchased: true,
      isSaved: true
    });

    // Increment downloads/reads count
    book.downloadsCount = (book.downloadsCount || 0) + 1;
    db.saveData();

    res.json({
      success: true,
      message: 'Payment verified successfully! Item unlocked in your library.',
      order: newOrder
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// POST /api/orders/unlock-free - unlock free study materials
router.post('/unlock-free', authenticateToken, (req, res) => {
  const { bookId } = req.body;
  const book = db.getBookById(bookId);

  if (!book) {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (!book.isFree) {
    return res.status(400).json({ error: 'This item is paid. Please complete payment.' });
  }

  db.addToLibrary({
    userId: req.user.id,
    bookId: book.id,
    progress: 0,
    lastReadPage: 1,
    lastReadAt: new Date().toISOString(),
    isPurchased: false,
    isSaved: true
  });

  book.downloadsCount = (book.downloadsCount || 0) + 1;
  db.saveData();

  res.json({
    success: true,
    message: 'Free study material added to your library!',
    book
  });
});

// GET /api/orders/my-orders - student order history
router.get('/my-orders', authenticateToken, (req, res) => {
  const orders = db.getUserOrders(req.user.id);
  res.json({ orders });
});

// GET /api/orders/all - admin view all orders
router.get('/all', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const orders = db.getOrders();
  const totalRevenue = orders
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  res.json({
    orders,
    totalRevenue,
    totalOrders: orders.length
  });
});

export default router;
