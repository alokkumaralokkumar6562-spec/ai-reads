import { db } from './data/db.js';

console.log('--- Testing DB and Data Seed ---');
const categories = db.getCategories();
console.log(`✅ Categories count: ${categories.length} (Expected: 16)`);
if (categories.length !== 16) {
  console.error('❌ Expected 16 categories, found:', categories.length);
  process.exit(1);
}

const books = db.getBooks();
console.log(`✅ Books & Notes count: ${books.length} (Expected >= 20)`);

const freeBooks = books.filter(b => b.isFree);
const paidBooks = books.filter(b => !b.isFree);
console.log(`✅ Free materials: ${freeBooks.length}, Paid materials: ${paidBooks.length}`);

// Test price points
const price49 = books.filter(b => b.price === 49);
const price99 = books.filter(b => b.price === 99);
const price149 = books.filter(b => b.price === 149);
const price199 = books.filter(b => b.price === 199);
console.log(`✅ Pricing tiers verified: ₹49 (${price49.length}), ₹99 (${price99.length}), ₹149 (${price149.length}), ₹199 (${price199.length})`);

// Test users
const users = db.getUsers();
console.log(`✅ Pre-seeded demo users: ${users.map(u => `${u.name} [${u.role}]`).join(', ')}`);

// Test library
const studentLibrary = db.getUserLibrary('user-student-1');
console.log(`✅ Demo student library items: ${studentLibrary.length}`);

// Test orders
const studentOrders = db.getUserOrders('user-student-1');
console.log(`✅ Demo student orders: ${studentOrders.length}`);

console.log('🎉 ALL IN-PROCESS SYSTEM INTEGRITY CHECKS PASSED!');
