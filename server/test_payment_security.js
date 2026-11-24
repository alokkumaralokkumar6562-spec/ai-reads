import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, generateToken } from './authMiddleware.js';
import paymentController from './paymentController.js';
import { db } from './data/db.js';

console.log('🛡️ RUNNING COMPREHENSIVE AI READS PAYMENT SECURITY AUDIT...\n');

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'aireads_test_secret_2026';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || RAZORPAY_KEY_SECRET;

const mockRes = () => {
  const res = {};
  res.statusCode = 200;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

// Setup fresh test users
const studentA = {
  id: 'user-sec-student-a',
  name: 'Security Test Student A',
  email: 'student_a@aireads.com',
  role: 'student'
};

const studentB = {
  id: 'user-sec-student-b',
  name: 'Security Test Student B (Attacker)',
  email: 'student_b@aireads.com',
  role: 'student'
};

// Find a target paid book that neither student owns
const targetBook = db.getBooks().find(b => !b.isFree && b.price > 0 && b.id !== 'book-ai-01');
if (!targetBook) {
  console.error('❌ Failed to find a paid test book in DB');
  process.exit(1);
}
console.log(`📌 Target paid book for audit: "${targetBook.title}" (ID: ${targetBook.id}, Price: ₹${targetBook.price})\n`);

// Clean previous test library entries if any
const existingLib = db.data.library.filter(
  l => (l.userId !== studentA.id && l.userId !== studentB.id) || l.bookId !== targetBook.id
);
db.data.library = existingLib;
db.saveData();

// =========================================================================
// TEST 1: Course Unlock Security - Order creation does NOT unlock content
// =========================================================================
console.log('--- TEST 1: Order Creation Security ---');
const createReq = {
  user: studentA,
  body: { bookId: targetBook.id }
};
const createRes = mockRes();
await paymentController.createOrder(createReq, createRes);

if (createRes.statusCode !== 200 || !createRes.body.orderId) {
  console.error('❌ FAIL: Order creation failed', createRes.body);
  process.exit(1);
}

const createdOrderId = createRes.body.orderId;
const orderInDb = db.findOrderByRazorpayOrderId(createdOrderId);

if (!orderInDb) {
  console.error('❌ FAIL: Order was not persisted to database at creation!');
  process.exit(1);
}

if (orderInDb.status !== 'created') {
  console.error(`❌ FAIL: Order status should be 'created', found '${orderInDb.status}'`);
  process.exit(1);
}

const isUnlockedPrematurely = db.isBookPurchased(studentA.id, targetBook.id);
if (isUnlockedPrematurely) {
  console.error('❌ CRITICAL SECURITY FLAW: Book was unlocked upon mere order creation!');
  process.exit(1);
}
console.log(`✅ PASS: Order created with status='created'. Book "${targetBook.id}" remains strictly LOCKED.\n`);

// =========================================================================
// TEST 2: Rejection of Fake / Simulated Bypass Signatures
// =========================================================================
console.log('--- TEST 2: Rejection of Fake Signatures & Bypass Tokens ---');
const fakeVerifyReq = {
  user: studentA,
  body: {
    razorpay_order_id: createdOrderId,
    razorpay_payment_id: 'pay_upi_fake_bypass',
    razorpay_signature: 'direct_upi_verified',
    bookId: targetBook.id
  }
};
const fakeVerifyRes = mockRes();
await paymentController.verifyPayment(fakeVerifyReq, fakeVerifyRes);

if (fakeVerifyRes.statusCode === 200) {
  console.error('❌ CRITICAL SECURITY FLAW: Direct UPI fake bypass was accepted!');
  process.exit(1);
}
console.log(`✅ PASS: Fake signature 'direct_upi_verified' correctly rejected with HTTP ${fakeVerifyRes.statusCode}: "${fakeVerifyRes.body.error}"`);

const sandboxFakeReq = {
  user: studentA,
  body: {
    razorpay_order_id: createdOrderId,
    razorpay_payment_id: 'pay_sim_12345',
    razorpay_signature: 'sandbox_verified_sig',
    bookId: targetBook.id
  }
};
const sandboxFakeRes = mockRes();
await paymentController.verifyPayment(sandboxFakeReq, sandboxFakeRes);

if (sandboxFakeRes.statusCode === 200) {
  console.error('❌ CRITICAL SECURITY FLAW: sandbox_verified_sig was accepted!');
  process.exit(1);
}
console.log(`✅ PASS: Fake signature 'sandbox_verified_sig' correctly rejected with HTTP ${sandboxFakeRes.statusCode}.\n`);

// =========================================================================
// TEST 3: Direct API Access Without Payment (Tampered HMAC Signature)
// =========================================================================
console.log('--- TEST 3: Direct API Call With Tampered / Invalid Signature ---');
const tamperedReq = {
  user: studentA,
  body: {
    razorpay_order_id: createdOrderId,
    razorpay_payment_id: 'pay_test_unauthorized_123',
    razorpay_signature: 'tampered_invalid_signature_abcdef1234567890',
    bookId: targetBook.id
  }
};
const tamperedRes = mockRes();
await paymentController.verifyPayment(tamperedReq, tamperedRes);

if (tamperedRes.statusCode === 200) {
  console.error('❌ CRITICAL SECURITY FLAW: Tampered signature was accepted!');
  process.exit(1);
}
console.log(`✅ PASS: Tampered signature rejected with HTTP ${tamperedRes.statusCode}: "${tamperedRes.body.error}"\n`);

// =========================================================================
// TEST 4: Unauthorized Order Access (Cross-User Order Hijacking)
// =========================================================================
console.log('--- TEST 4: Preventing Order Hijacking by Another User ---');
const legitimatePaymentId = `pay_test_${Date.now()}_999`;
const legitimateSignature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(`${createdOrderId}|${legitimatePaymentId}`)
  .digest('hex');

const attackerReq = {
  user: studentB, // Student B attempting to verify Student A's order
  body: {
    razorpay_order_id: createdOrderId,
    razorpay_payment_id: legitimatePaymentId,
    razorpay_signature: legitimateSignature,
    bookId: targetBook.id
  }
};
const attackerRes = mockRes();
await paymentController.verifyPayment(attackerReq, attackerRes);

if (attackerRes.statusCode !== 403) {
  console.error(`❌ CRITICAL SECURITY FLAW: Order hijacking was not blocked with 403! Got ${attackerRes.statusCode}`);
  process.exit(1);
}
console.log(`✅ PASS: Attacker prevented from verifying another user's order (HTTP 403): "${attackerRes.body.error}"\n`);

// =========================================================================
// TEST 5: Legitimate Successful Payment Verification & Content Unlock
// =========================================================================
console.log('--- TEST 5: Legitimate Payment Verification & Content Unlock ---');
const legitReq = {
  user: studentA,
  body: {
    razorpay_order_id: createdOrderId,
    razorpay_payment_id: legitimatePaymentId,
    razorpay_signature: legitimateSignature,
    bookId: targetBook.id
  }
};
const legitRes = mockRes();
await paymentController.verifyPayment(legitReq, legitRes);

if (legitRes.statusCode !== 200 || !legitRes.body.success) {
  console.error('❌ FAIL: Legitimate verification failed', legitRes.body);
  process.exit(1);
}

const isNowUnlocked = db.isBookPurchased(studentA.id, targetBook.id);
if (!isNowUnlocked) {
  console.error('❌ FAIL: Book was not unlocked in library after successful verification!');
  process.exit(1);
}

const verifiedOrderInDb = db.findOrderByRazorpayOrderId(createdOrderId);
if (verifiedOrderInDb.status !== 'paid' || verifiedOrderInDb.razorpayPaymentId !== legitimatePaymentId) {
  console.error('❌ FAIL: Database order status was not updated to paid');
  process.exit(1);
}
console.log(`✅ PASS: Payment verified via HMAC SHA-256. Order marked status='paid'. Book unlocked in student library.\n`);

// =========================================================================
// TEST 6: Repeated Payment Verification (Anti-Replay Attack)
// =========================================================================
console.log('--- TEST 6: Anti-Replay Attack & Duplicate Payment Prevention ---');
// 6a. Try to verify the exact same order again
const replayOrderRes = mockRes();
await paymentController.verifyPayment(legitReq, replayOrderRes);
if (replayOrderRes.statusCode !== 409) {
  console.error(`❌ FAIL: Duplicate verification on paid order should return 409 Conflict, got ${replayOrderRes.statusCode}`);
  process.exit(1);
}
console.log(`✅ PASS: Duplicate verification rejected with HTTP 409: "${replayOrderRes.body.error}"`);

// 6b. Try to create a second order and replay the SAME payment ID
const secondBook = db.getBooks().find(b => !b.isFree && b.id !== targetBook.id && b.id !== 'book-ai-01');
const order2Req = { user: studentA, body: { bookId: secondBook.id } };
const order2Res = mockRes();
await paymentController.createOrder(order2Req, order2Res);

const replayPaymentIdReq = {
  user: studentA,
  body: {
    razorpay_order_id: order2Res.body.orderId,
    razorpay_payment_id: legitimatePaymentId, // Reusing previous payment ID
    razorpay_signature: crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${order2Res.body.orderId}|${legitimatePaymentId}`)
      .digest('hex'),
    bookId: secondBook.id
  }
};
const replayPaymentIdRes = mockRes();
await paymentController.verifyPayment(replayPaymentIdReq, replayPaymentIdRes);

if (replayPaymentIdRes.statusCode !== 409) {
  console.error(`❌ CRITICAL SECURITY FLAW: Reused payment ID was not rejected with 409! Got ${replayPaymentIdRes.statusCode}`);
  process.exit(1);
}
console.log(`✅ PASS: Replay attack blocked (HTTP 409): "${replayPaymentIdRes.body.error}"\n`);

// =========================================================================
// TEST 7: Webhook Signature Verification & Idempotency
// =========================================================================
console.log('--- TEST 7: Razorpay Webhook Signature Verification & Idempotency ---');
// Create a 3rd order for webhook fulfillment test
const webhookOrderReq = { user: studentB, body: { bookId: targetBook.id } };
const webhookOrderRes = mockRes();
await paymentController.createOrder(webhookOrderReq, webhookOrderRes);
const webhookOrderId = webhookOrderRes.body.orderId;
const webhookPaymentId = `pay_wh_${Date.now()}`;

// 7a. Test invalid webhook signature
const badWebhookReq = {
  headers: { 'x-razorpay-signature': 'invalid_signature_xyz' },
  rawBody: JSON.stringify({ event: 'payment.captured' }),
  body: { event: 'payment.captured' }
};
const badWebhookRes = mockRes();
await paymentController.handleWebhook(badWebhookReq, badWebhookRes);

if (badWebhookRes.statusCode !== 400) {
  console.error(`❌ FAIL: Invalid webhook signature should return 400, got ${badWebhookRes.statusCode}`);
  process.exit(1);
}
console.log('✅ PASS: Webhook with invalid signature rejected with HTTP 400.');

// 7b. Test valid webhook payment.captured event
const validWebhookPayload = {
  event: 'payment.captured',
  payload: {
    payment: {
      entity: {
        id: webhookPaymentId,
        order_id: webhookOrderId,
        amount: Math.round(targetBook.price * 100),
        status: 'captured'
      }
    }
  }
};
const rawPayloadString = JSON.stringify(validWebhookPayload);
const validWebhookSignature = crypto
  .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
  .update(rawPayloadString)
  .digest('hex');

const validWebhookReq = {
  headers: { 'x-razorpay-signature': validWebhookSignature },
  rawBody: rawPayloadString,
  body: validWebhookPayload
};
const validWebhookRes = mockRes();
await paymentController.handleWebhook(validWebhookReq, validWebhookRes);

if (validWebhookRes.statusCode !== 200 || validWebhookRes.body.status !== 'processed_and_unlocked') {
  console.error('❌ FAIL: Webhook failed to process captured payment', validWebhookRes.body);
  process.exit(1);
}

const isStudentBUnlocked = db.isBookPurchased(studentB.id, targetBook.id);
if (!isStudentBUnlocked) {
  console.error('❌ FAIL: Webhook did not unlock book for student B');
  process.exit(1);
}
console.log('✅ PASS: Valid webhook event verified and fulfilled. Content unlocked in student B library.');

// 7c. Test Webhook Idempotency (duplicate delivery)
const duplicateWebhookRes = mockRes();
await paymentController.handleWebhook(validWebhookReq, duplicateWebhookRes);
if (duplicateWebhookRes.statusCode !== 200 || duplicateWebhookRes.body.status !== 'already_processed') {
  console.error('❌ FAIL: Webhook was not idempotent for duplicate event', duplicateWebhookRes.body);
  process.exit(1);
}
console.log('✅ PASS: Duplicate webhook event handled idempotently (status: already_processed).\n');

// =========================================================================
// TEST 8: Server-Side Access Control - Unpaid User Cannot Access Paid Content
// =========================================================================
console.log('--- TEST 8: Unpaid Content Access Control Verification ---');
// Student A does not own secondBook
const unpaidAccessReq = {
  user: studentA,
  params: { id: secondBook.id }
};
const unpaidAccessRes = mockRes();
paymentController.checkBookAccess(unpaidAccessReq, unpaidAccessRes);

if (unpaidAccessRes.body.unlocked !== false || unpaidAccessRes.body.previewOnly !== true) {
  console.error('❌ FAIL: Unpaid user was granted full access to paid book!', unpaidAccessRes.body);
  process.exit(1);
}
console.log(`✅ PASS: Unpaid user restricted to preview pages (unlocked: false, maxPreviewPages: 3).`);

// Student A does own targetBook (verified in Test 5)
const paidAccessReq = {
  user: studentA,
  params: { id: targetBook.id }
};
const paidAccessRes = mockRes();
paymentController.checkBookAccess(paidAccessReq, paidAccessRes);

if (paidAccessRes.body.unlocked !== true || paidAccessRes.body.previewOnly !== false) {
  console.error('❌ FAIL: Verified buyer was not granted full access to paid book!', paidAccessRes.body);
  process.exit(1);
}
console.log(`✅ PASS: Verified buyer granted full access (unlocked: true, isPurchased: true).\n`);

console.log('🏆 100% OF PAYMENT SECURITY CHECKS PASSED SUCCESSFULLY!');
console.log('🔒 Confirmed: Unpaid users CANNOT unlock or access paid content.');
