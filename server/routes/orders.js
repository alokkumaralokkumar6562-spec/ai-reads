import express from 'express';
import { authenticateToken } from '../authMiddleware.js';
import paymentController from '../paymentController.js';

const router = express.Router();

// GET /api/orders/config - public config (Key ID, mode)
router.get('/config', paymentController.getPaymentConfig);

// POST /api/orders/create - create Razorpay order (Protected by JWT)
router.post('/create', authenticateToken, paymentController.createOrder);

// POST /api/orders/verify - verify HMAC SHA-256 signature and unlock material (Protected by JWT)
router.post('/verify', authenticateToken, paymentController.verifyPayment);

// POST /api/orders/webhook - Razorpay webhook signature verification & idempotent fulfillment
router.post('/webhook', paymentController.handleWebhook);

// POST /api/orders/unlock-free - unlock 100% free notes (Protected by JWT)
router.post('/unlock-free', authenticateToken, paymentController.unlockFree);

// GET /api/orders/my-orders - fetch student purchase history (Protected by JWT)
router.get('/my-orders', authenticateToken, paymentController.getMyOrders);

// GET /api/orders/all - admin view all platform transactions (Admin JWT required)
router.get('/all', authenticateToken, paymentController.getAllOrders);

export default router;
