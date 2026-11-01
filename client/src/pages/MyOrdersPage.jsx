import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, CheckCircle, Clock, Download, FileText,
  ShieldCheck, Printer, X, BookOpen, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MyOrdersPage({ onOpenReader }) {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (token) {
      fetch('/api/orders/my-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setOrders(data.orders || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
            <ShoppingBag className="w-4 h-4" /> Payment History
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            My Orders & Receipts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verified Razorpay transactions, lifetime license proofs, and official invoices.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900">
          <ShieldCheck className="w-4 h-4" /> 100% Verified Secure Payments
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading order history...</div>
      ) : orders.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Order Details</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{ord.bookTitle}</p>
                      <p className="text-[11px] text-slate-400">By {ord.bookAuthor} • ID: <span className="font-mono">{ord.id}</span></p>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                        ₹{ord.amount}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle className="w-3 h-3" /> Paid & Verified
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedInvoice(ord)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-500" />
                          Invoice
                        </button>
                        <Link
                          to={`/book/${ord.bookId}`}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                        >
                          View Book
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-24 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Orders Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't purchased any paid books or notes yet. Browse our store to unlock premium materials!
          </p>
          <Link
            to="/paid"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
          >
            Explore Paid Notes (₹49 - ₹199)
          </Link>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">

            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  AI
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Reads Invoice</h3>
                  <p className="text-[10px] text-slate-400">Order #{selectedInvoice.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Billed To:</span>
                <span className="font-semibold">{selectedInvoice.userName} ({selectedInvoice.userEmail})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Gateway:</span>
                <span className="font-semibold">Razorpay (Verified)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono text-[11px]">{selectedInvoice.razorpayPaymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span>{new Date(selectedInvoice.createdAt).toLocaleString()}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>{selectedInvoice.bookTitle}</span>
                  <span>₹{selectedInvoice.amount}</span>
                </div>
                <p className="text-[10px] text-slate-400">Digital Book / Notes • Lifetime Online Reader Access</p>
              </div>

              <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Total Paid:</span>
                <span className="text-indigo-600 dark:text-indigo-400">₹{selectedInvoice.amount} INR</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
