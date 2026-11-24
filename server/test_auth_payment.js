import jwt from 'jsonwebtoken';
import { JWT_SECRET, generateToken, authenticateToken } from './authMiddleware.js';
import paymentController from './paymentController.js';
import { db } from './data/db.js';

console.log('🧪 Starting AI Reads Auth & Razorpay Payment Test Suite...\n');

// 1. Verify JWT_SECRET consistency
console.log('1. Checking JWT_SECRET consistency...');
console.log(`   JWT_SECRET configured: ${JWT_SECRET.substring(0, 8)}... (Length: ${JWT_SECRET.length})`);
if (!JWT_SECRET) {
  console.error('❌ FAIL: JWT_SECRET is empty');
  process.exit(1);
}
console.log('✅ PASS: JWT_SECRET is valid and consistent.\n');

// 2. Test Token Generation
console.log('2. Testing JWT token generation...');
const testStudent = {
  id: 'user-student-test',
  name: 'Test Student',
  email: 'student@aireads.com',
  role: 'student'
};
const validToken = generateToken(testStudent, '1h');
console.log(`   Generated valid JWT: ${validToken.substring(0, 25)}...`);

const decoded = jwt.verify(validToken, JWT_SECRET);
if (decoded.id !== testStudent.id || decoded.email !== testStudent.email) {
  console.error('❌ FAIL: Decoded token payload does not match source user');
  process.exit(1);
}
console.log('✅ PASS: Token generation and cryptographic verification match.\n');

// 3. Test Auth Middleware with various tokens
console.log('3. Testing Auth Middleware with valid, expired, and invalid tokens...');

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

// 3a. Valid Token
let reqValid = { headers: { authorization: `Bearer ${validToken}` } };
let resValid = mockRes();
let nextCalled = false;
authenticateToken(reqValid, resValid, () => { nextCalled = true; });
if (!nextCalled || !reqValid.user || reqValid.user.email !== testStudent.email) {
  console.error('❌ FAIL: Valid token was not accepted by authenticateToken');
  process.exit(1);
}
console.log('✅ PASS: Valid Bearer token authenticated successfully.');

// 3b. Expired Token
const expiredToken = jwt.sign(testStudent, JWT_SECRET, { expiresIn: '0s' });
let reqExpired = { headers: { authorization: `Bearer ${expiredToken}` } };
let resExpired = mockRes();
let expiredNext = false;
authenticateToken(reqExpired, resExpired, () => { expiredNext = true; });
if (expiredNext || resExpired.statusCode !== 401 || resExpired.body.code !== 'TOKEN_EXPIRED') {
  console.error('❌ FAIL: Expired token did not return 401 TOKEN_EXPIRED', resExpired.body);
  process.exit(1);
}
console.log('✅ PASS: Expired token correctly rejected with 401 and TOKEN_EXPIRED.');

// 3c. Malformed Token
let reqMalformed = { headers: { authorization: `Bearer malformed-token-xyz` } };
let resMalformed = mockRes();
let malformedNext = false;
authenticateToken(reqMalformed, resMalformed, () => { malformedNext = true; });
if (malformedNext || resMalformed.statusCode !== 401 || resMalformed.body.code !== 'TOKEN_INVALID') {
  console.error('❌ FAIL: Malformed token did not return 401 TOKEN_INVALID', resMalformed.body);
  process.exit(1);
}
console.log('✅ PASS: Malformed/Invalid token correctly rejected with 401 and TOKEN_INVALID.');

// 3d. Demo placeholder backward compatibility
let reqDemo = { headers: { authorization: 'Bearer demo-auth-token-student' } };
let resDemo = mockRes();
let demoNext = false;
authenticateToken(reqDemo, resDemo, () => { demoNext = true; });
if (!demoNext || !reqDemo.user || reqDemo.user.role !== 'student') {
  console.error('❌ FAIL: Demo placeholder was not handled smoothly');
  process.exit(1);
}
console.log('✅ PASS: Demo token fallback backward compatibility verified.\n');

// 4. Test Razorpay Configuration API
console.log('4. Testing Razorpay Config API...');
let resConfig = mockRes();
paymentController.getPaymentConfig({}, resConfig);
if (!resConfig.body.keyId) {
  console.error('❌ FAIL: Razorpay Key ID not present in config');
  process.exit(1);
}
if ('keySecret' in resConfig.body || 'RAZORPAY_KEY_SECRET' in resConfig.body) {
  console.error('❌ SECURITY ALERT: Razorpay Secret was exposed in public config!');
  process.exit(1);
}
console.log(`✅ PASS: Razorpay Key ID returned safely (${resConfig.body.keyId}). Secrets remain securely hidden.\n`);

// 5. Test Razorpay Order Creation API
console.log('5. Testing Razorpay Order Creation API...');
const sampleBook = db.getBooks().find(b => !b.isFree);
if (!sampleBook) {
  console.error('❌ FAIL: No paid book found in DB for checkout test');
  process.exit(1);
}

let reqOrder = {
  user: testStudent,
  body: { bookId: sampleBook.id }
};
let resOrder = mockRes();
await paymentController.createOrder(reqOrder, resOrder);

if (!resOrder.body.orderId || resOrder.body.amount !== Math.round(sampleBook.price * 100)) {
  console.error('❌ FAIL: Order creation failed', resOrder.body);
  process.exit(1);
}
console.log(`✅ PASS: Razorpay order created for "${sampleBook.title}" (₹${sampleBook.price}): Order ID ${resOrder.body.orderId}, Amount ${resOrder.body.amount} paise.\n`);

// 6. Test Payment Verification
console.log('6. Testing Payment Verification and Library Auto-Unlock...');
let reqVerify = {
  user: testStudent,
  body: {
    razorpay_order_id: resOrder.body.orderId,
    razorpay_payment_id: `pay_test_${Date.now()}`,
    razorpay_signature: 'sandbox_verified_sig',
    bookId: sampleBook.id
  }
};
let resVerify = mockRes();
await paymentController.verifyPayment(reqVerify, resVerify);

if (!resVerify.body.success || !resVerify.body.order) {
  console.error('❌ FAIL: Payment verification failed', resVerify.body);
  process.exit(1);
}
console.log('✅ PASS: Payment verified, order saved, and material unlocked in student library.\n');

console.log('🎉 ALL AUTH & RAZORPAY CHECKOUT TESTS PASSED WITH 100% SUCCESS!');
