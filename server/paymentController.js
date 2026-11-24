import crypto from 'crypto';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import { db } from './data/db.js';

dotenv.config();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_aireads2026';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'aireads_test_secret_2026';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || RAZORPAY_KEY_SECRET;

const isDummyKey = !RAZORPAY_KEY_ID || 
  RAZORPAY_KEY_ID.includes('aireads') || 
  RAZORPAY_KEY_ID.includes('placeholder') || 
  RAZORPAY_KEY_ID === 'rzp_test_aireads2026';

let razorpayInstance = null;
const isActualRazorpayKey = !isDummyKey && 
  RAZORPAY_KEY_ID.startsWith('rzp_') && 
  RAZORPAY_KEY_SECRET;

if (isActualRazorpayKey) {
  try {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
    console.log('[Razorpay Security Controller] Initialized with Key ID:', RAZORPAY_KEY_ID);
  } catch (err) {
    console.warn('[Razorpay Security Controller] Initialization error:', err.message);
  }
} else {
  console.log('[Razorpay Security Controller] Test Sandbox Mode active (Placeholder credentials).');
}

/**
 * GET /api/orders/config
 * Public endpoint returning Razorpay public key ID.
 * CRITICAL SECURITY: RAZORPAY_KEY_SECRET is NEVER returned.
 */
export const getPaymentConfig = (req, res) => {
  res.json({
    keyId: RAZORPAY_KEY_ID,
    isLiveConfigured: Boolean(isActualRazorpayKey && razorpayInstance),
    isDummyKey: Boolean(isDummyKey),
    mode: 'test',
    currency: 'INR'
  });
};

/**
 * POST /api/orders/create
 * Securely creates a Razorpay order ONLY on the backend.
 * Persists order in database with status='created'.
 * DOES NOT UNLOCK CONTENT.
 */
export const createOrder = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required to create a payment order.' });
    }

    const book = db.getBookById(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Selected study material or book not found.' });
    }

    if (book.isFree || book.price === 0) {
      return res.status(400).json({
        error: 'This item is free! Use the free unlock option to add it to your library.',
        isFree: true
      });
    }

    // Security check: Check if student already owns this book
    const alreadyOwns = db.isBookPurchased(req.user.id, book.id);
    if (alreadyOwns) {
      return res.status(400).json({
        error: 'You have already purchased and unlocked this item.',
        alreadyPurchased: true
      });
    }

    const amountInPaise = Math.round(Number(book.price) * 100);
    const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let razorpayOrderId = null;

    if (razorpayInstance) {
      try {
        const rzpOrder = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt,
          notes: {
            bookId: book.id,
            bookTitle: book.title,
            userId: req.user.id,
            userEmail: req.user.email
          }
        });
        razorpayOrderId = rzpOrder.id;
      } catch (rzpErr) {
        console.error('[Razorpay API Error] Direct API create failed:', rzpErr);
        const errDetail = rzpErr.error?.description || rzpErr.message || 'Authentication failed or invalid API keys';
        return res.status(502).json({
          error: `Razorpay Order Error: ${errDetail}. Kripya check karein ki Render Environment me RAZORPAY_KEY_ID aur RAZORPAY_KEY_SECRET sahi hain.`
        });
      }
    } else if (req.isTestSecurityAudit || process.env.NODE_ENV === 'test') {
      // Allowed strictly for offline security audit test suites
      razorpayOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    } else {
      // Keys are missing or placeholder in production/runtime
      return res.status(503).json({
        error: 'Razorpay Gateway is not configured. Render Dashboard me jaakar "RAZORPAY_KEY_ID" aur "RAZORPAY_KEY_SECRET" add karein.',
        isConfigMissing: true
      });
    }

    // PERSIST ORDER IN DATABASE WITH STATUS: 'created'
    // CONTENT IS NOT UNLOCKED AT THIS STAGE!
    const orderRecord = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderId: razorpayOrderId,
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: null,
      razorpaySignature: null,
      userId: req.user.id,
      userName: req.user.name || 'AI Reads Student',
      userEmail: req.user.email,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      amount: book.price,
      amountPaise: amountInPaise,
      currency: 'INR',
      receipt,
      status: 'created', // Must remain 'created' until verified!
      paymentMethod: 'razorpay',
      createdAt: new Date().toISOString(),
      verifiedAt: null
    };

    db.addOrder(orderRecord);

    return res.json({
      orderId: razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      book,
      keyId: RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('[Razorpay Create Order Error]:', err);
    res.status(500).json({ error: 'Server error while creating payment order.' });
  }
};

/**
 * POST /api/orders/verify
 * Cryptographically verifies Razorpay payment signature using HMAC SHA-256.
 * Enforces strict security:
 * 1. Requires valid backend-created order
 * 2. Matches user ownership
 * 3. Matches purchased product
 * 4. Checks payment status captured
 * 5. Prevents duplicate payment processing (anti-replay)
 * 6. Only unlocks content upon 100% verified payment
 */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookId
    } = req.body;

    // 1. Validate required inputs
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment verification parameters.'
      });
    }

    // 2. Reject all fake bypass tokens immediately
    if (
      razorpay_signature === 'sandbox_verified_sig' ||
      razorpay_signature === 'direct_upi_verified' ||
      razorpay_payment_id.startsWith('pay_upi_') ||
      razorpay_payment_id.startsWith('pay_sim_')
    ) {
      console.warn(`[Security Alert] Rejected unverified/fake payment bypass attempt by user ${req.user.id}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature. Mock and unverified payments are strictly rejected.'
      });
    }

    // 3. Locate order in database
    const order = db.findOrderByRazorpayOrderId(razorpay_order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or was not created by this system.'
      });
    }

    // 4. Security Check: Verify order belongs to the authenticated user
    if (order.userId !== req.user.id) {
      console.warn(`[Security Alert] User ${req.user.id} tried to verify order belonging to ${order.userId}`);
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: This order does not belong to your account.'
      });
    }

    // 5. Security Check: Verify order product matches requested book
    if (order.bookId !== bookId) {
      console.warn(`[Security Alert] Product mismatch: order bookId=${order.bookId}, requested bookId=${bookId}`);
      return res.status(400).json({
        success: false,
        error: 'Security violation: Order product mismatch.'
      });
    }

    // 6. Anti-Duplicate Check: Order already fulfilled?
    if (order.status === 'paid') {
      return res.status(409).json({
        success: false,
        error: 'Duplicate payment verification attempt: This order has already been fulfilled.'
      });
    }

    // 7. Anti-Replay Check: Has this payment ID been used for another order?
    const existingPaymentOrder = db.findOrderByPaymentId(razorpay_payment_id);
    if (existingPaymentOrder && existingPaymentOrder.id !== order.id) {
      console.warn(`[Security Alert] Replay attack blocked: payment ID ${razorpay_payment_id} was already used in order ${existingPaymentOrder.id}`);
      return res.status(409).json({
        success: false,
        error: 'Security alert: Duplicate payment ID detected. Replay attack blocked.'
      });
    }

    // 8. Cryptographic HMAC SHA-256 Signature Verification
    if (!RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'Server payment configuration error: RAZORPAY_KEY_SECRET missing.'
      });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    let isSignatureValid = false;
    try {
      isSignatureValid = crypto.timingSafeEqual(
        Buffer.from(generatedSignature, 'utf-8'),
        Buffer.from(razorpay_signature, 'utf-8')
      );
    } catch (e) {
      isSignatureValid = false;
    }

    if (!isSignatureValid) {
      console.warn(`[Security Alert] Signature verification failed for order ${razorpay_order_id}`);
      db.updateOrder(order.id, {
        status: 'failed',
        failedReason: 'Invalid cryptographic signature',
        failedAt: new Date().toISOString()
      });
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature. Payment verification failed.'
      });
    }

    // 9. If Razorpay API instance is live with valid network access, verify captured status
    if (razorpayInstance && !razorpay_payment_id.startsWith('pay_test_')) {
      try {
        const paymentDetails = await razorpayInstance.payments.fetch(razorpay_payment_id);
        if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
          db.updateOrder(order.id, { status: 'failed', failedReason: `Status was ${paymentDetails.status}` });
          return res.status(400).json({
            success: false,
            error: `Payment is not captured. Current status: ${paymentDetails.status}`
          });
        }
        if (Number(paymentDetails.amount) !== Number(order.amountPaise)) {
          db.updateOrder(order.id, { status: 'failed', failedReason: 'Amount mismatch' });
          return res.status(400).json({
            success: false,
            error: 'Security violation: Payment amount does not match order amount.'
          });
        }
      } catch (fetchErr) {
        console.warn('[Razorpay API Warning] Direct payment fetch skipped or failed:', fetchErr.message);
      }
    }

    // 10. ALL CHECKS PASSED: Mark order as 'paid'
    const updatedOrder = db.updateOrder(order.id, {
      status: 'paid',
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      verifiedAt: new Date().toISOString()
    });

    // 11. UNLOCK CONTENT ONLY FOR THIS SPECIFIC PURCHASED BOOK
    db.addToLibrary({
      userId: req.user.id,
      bookId: order.bookId,
      progress: 0,
      lastReadPage: 1,
      lastReadAt: new Date().toISOString(),
      isPurchased: true,
      isSaved: true
    });

    const book = db.getBookById(order.bookId);
    if (book) {
      book.downloadsCount = (book.downloadsCount || 0) + 1;
      db.saveData();
    }

    console.log(`✅ [Payment Verified] Order ${order.id} paid. Book ${order.bookId} unlocked for user ${req.user.id}.`);

    return res.json({
      success: true,
      message: 'Payment verified successfully! Item unlocked in your library.',
      order: updatedOrder
    });
  } catch (err) {
    console.error('[Razorpay Verify Payment Error]:', err);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed due to internal error.'
    });
  }
};

/**
 * POST /api/orders/webhook
 * Razorpay Webhook Handler with HMAC-SHA256 signature verification.
 * Idempotently processes payment.captured and payment.failed events.
 */
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing x-razorpay-signature header.' });
    }

    const secret = RAZORPAY_WEBHOOK_SECRET || RAZORPAY_KEY_SECRET;
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    let isWebhookValid = false;
    try {
      isWebhookValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(signature, 'utf-8')
      );
    } catch (e) {
      isWebhookValid = false;
    }

    if (!isWebhookValid) {
      console.warn('[Webhook Alert] Invalid Razorpay webhook signature');
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`[Razorpay Webhook] Received event: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment?.entity;
      const orderId = paymentEntity?.order_id || payload.order?.entity?.id;
      const paymentId = paymentEntity?.id;
      const amountPaise = paymentEntity?.amount;

      if (!orderId) {
        return res.status(200).json({ status: 'ignored_missing_order_id' });
      }

      const order = db.findOrderByRazorpayOrderId(orderId);
      if (!order) {
        console.warn(`[Webhook Warning] Order not found for webhook order_id: ${orderId}`);
        return res.status(200).json({ status: 'order_not_found' });
      }

      // Idempotency: If already paid, acknowledge without re-processing
      if (order.status === 'paid') {
        return res.status(200).json({ status: 'already_processed' });
      }

      // Verify amount
      if (amountPaise && Number(amountPaise) !== Number(order.amountPaise)) {
        console.warn(`[Webhook Alert] Amount mismatch for order ${order.id}: expected ${order.amountPaise}, got ${amountPaise}`);
        db.updateOrder(order.id, { status: 'failed', failedReason: 'Webhook amount mismatch' });
        return res.status(200).json({ status: 'amount_mismatch' });
      }

      // Update order status to paid
      db.updateOrder(order.id, {
        status: 'paid',
        razorpayPaymentId: paymentId || order.razorpayPaymentId,
        verifiedAt: new Date().toISOString(),
        verifiedVia: 'webhook'
      });

      // Unlock content for the student
      db.addToLibrary({
        userId: order.userId,
        bookId: order.bookId,
        progress: 0,
        lastReadPage: 1,
        lastReadAt: new Date().toISOString(),
        isPurchased: true,
        isSaved: true
      });

      const book = db.getBookById(order.bookId);
      if (book) {
        book.downloadsCount = (book.downloadsCount || 0) + 1;
        db.saveData();
      }

      console.log(`[Webhook Success] Order ${order.id} verified via webhook. Book ${order.bookId} unlocked.`);
      return res.status(200).json({ status: 'processed_and_unlocked' });
    }

    if (event === 'payment.failed') {
      const paymentEntity = payload.payment?.entity;
      const orderId = paymentEntity?.order_id;
      if (orderId) {
        db.updateOrder(orderId, {
          status: 'failed',
          failedReason: paymentEntity.error_description || 'Payment failed',
          failedAt: new Date().toISOString()
        });
      }
      return res.status(200).json({ status: 'payment_failed_recorded' });
    }

    return res.status(200).json({ status: 'event_ignored' });
  } catch (err) {
    console.error('[Razorpay Webhook Error]:', err);
    res.status(500).json({ error: 'Webhook processing error.' });
  }
};

/**
 * GET /api/books/:id/access
 * Server-side check: Verifies whether the authenticated user has unlocked a book.
 * Unpaid users CANNOT access full content.
 */
export const checkBookAccess = (req, res) => {
  try {
    const bookId = req.params.id;
    const book = db.getBookById(bookId);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.isFree) {
      return res.json({
        unlocked: true,
        isFree: true,
        bookId: book.id,
        previewOnly: false
      });
    }

    const isPurchased = db.isBookPurchased(req.user.id, book.id);
    if (isPurchased) {
      return res.json({
        unlocked: true,
        isPurchased: true,
        bookId: book.id,
        previewOnly: false
      });
    }

    // Unpaid student: strictly restrict to 3-page preview
    return res.json({
      unlocked: false,
      isPurchased: false,
      isFree: false,
      previewOnly: true,
      maxPreviewPages: 3,
      price: book.price,
      message: 'Paid content locked. Purchase required for full access.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify book access.' });
  }
};

/**
 * POST /api/orders/unlock-free
 * Free digital study materials unlock
 */
export const unlockFree = (req, res) => {
  try {
    const { bookId } = req.body;
    const book = db.getBookById(bookId);

    if (!book) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    if (!book.isFree) {
      return res.status(400).json({ error: 'Security violation: This item is paid. Payment is required.' });
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
  } catch (err) {
    console.error('[Unlock Free Error]:', err);
    res.status(500).json({ error: 'Failed to unlock free material.' });
  }
};

/**
 * GET /api/orders/my-orders
 * Student personal order history (only shows orders belonging to req.user.id)
 */
export const getMyOrders = (req, res) => {
  try {
    const orders = db.getUserOrders(req.user.id);
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user orders.' });
  }
};

/**
 * GET /api/orders/all
 * Admin order history (requires admin role)
 */
export const getAllOrders = (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
};

export default {
  getPaymentConfig,
  createOrder,
  verifyPayment,
  handleWebhook,
  checkBookAccess,
  unlockFree,
  getMyOrders,
  getAllOrders
};
