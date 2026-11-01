import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X, ShieldCheck, CheckCircle2, Lock, CreditCard,
  Smartphone, Zap, AlertCircle, ArrowRight, Loader2, Building, Copy, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { siteConfig } from '../config/siteConfig';

export default function PaymentModal({ book, isOpen, onClose, onSuccess }) {
  const { user, token, openAuthModal } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('review'); // 'review' | 'success'
  const [activeGateway, setActiveGateway] = useState('razorpay'); // 'razorpay' | 'direct_upi'
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);

  if (!isOpen || !book) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const copyText = (text, type) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === 'upi') {
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 2000);
      } else {
        setCopiedAcc(true);
        setTimeout(() => setCopiedAcc(false), 2000);
      }
    }
  };

  const handlePay = async () => {
    if (!user) {
      onClose();
      openAuthModal('login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (activeGateway === 'direct_upi') {
        // Direct UPI / Bank manual approval simulation
        await new Promise(r => setTimeout(r, 600));
        await verifyPayment({
          razorpay_order_id: `upi_direct_${Date.now()}`,
          razorpay_payment_id: `pay_upi_${Date.now()}`,
          razorpay_signature: 'direct_upi_verified',
          bookId: book.id
        });
        return;
      }

      // 1. Create order on backend
      const orderRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookId: book.id })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create payment order');

      // 2. Check if Razorpay SDK loaded and keys available
      const rzpConfigRes = await fetch('/api/orders/config');
      const rzpConfig = await rzpConfigRes.json();

      if (rzpConfig.isLiveConfigured && window.Razorpay) {
        // Real Razorpay Checkout flow
        const options = {
          key: rzpConfig.keyId,
          amount: orderData.amount,
          currency: 'INR',
          name: 'AI Reads Learning Platform',
          description: `Access to ${book.title}`,
          order_id: orderData.orderId,
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: '#6366f1'
          },
          handler: async (response) => {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookId: book.id
            });
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Sandbox fallback mode
        await new Promise(r => setTimeout(r, 700));
        await verifyPayment({
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_signature: 'sandbox_verified_sig',
          bookId: book.id
        });
      }
    } catch (err) {
      console.error('Payment failure:', err);
      setError(err.message || 'Payment initiation failed. Please try again.');
      setLoading(false);
    }
  };

  const verifyPayment = async (payload) => {
    try {
      const res = await fetch('/api/orders/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment verification failed');

      setLoading(false);
      setStep('success');
      triggerConfetti();
      if (onSuccess) onSuccess(book);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Lock className="w-4 h-4" />
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Secure Checkout & Unlocking
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'review' ? (
          <div className="p-6 space-y-5">

            {/* Book summary card */}
            <div className="flex gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-16 h-20 object-cover rounded-xl shadow-sm shrink-0"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {book.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {book.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    By {book.author}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Digital PDF + Online Reader Access</span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">₹{book.price}</span>
                </div>
              </div>
            </div>

            {/* Payment Gateway Toggle: Razorpay vs Direct Bank/UPI */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Payment Channel
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveGateway('razorpay')}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    activeGateway === 'razorpay'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Razorpay Gateway (Automated)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGateway('direct_upi')}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    activeGateway === 'direct_upi'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Direct UPI / Bank Transfer
                </button>
              </div>
            </div>

            {/* Direct Bank Account / UPI Details View */}
            {activeGateway === 'direct_upi' ? (
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-xs space-y-2.5">
                <p className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                  <span>Pay directly to Creator's Account:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black text-sm">₹{book.price}</span>
                </p>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">UPI ID:</span>
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{siteConfig.banking.upiId}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(siteConfig.banking.upiId, 'upi')}
                    className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 text-[11px] font-semibold flex items-center gap-1"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedUpi ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950 space-y-1 font-mono text-[11px]">
                  <p><strong>Bank:</strong> {siteConfig.banking.bankName}</p>
                  <p><strong>A/C No:</strong> {siteConfig.banking.accountNumber}</p>
                  <p><strong>IFSC:</strong> {siteConfig.banking.ifscCode}</p>
                  <p><strong>Name:</strong> {siteConfig.banking.accountHolderName}</p>
                </div>

                <p className="text-[10px] text-slate-500">
                  PhonePe, Google Pay ya Paytm se scan karke pay karein aur neeche diye gaye button par click karein.
                </p>
              </div>
            ) : (
              /* Pricing Breakdown */
              <div className="space-y-1.5 py-2 text-xs border-y border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-slate-500">
                  <span>Original Notes Price</span>
                  <span className="line-through">₹{book.price * 2}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Student Discount (50% OFF)</span>
                  <span>- ₹{book.price}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1">
                  <span>Total Amount Payable</span>
                  <span className="text-base text-indigo-600 dark:text-indigo-400">₹{book.price}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Payment...
                </>
              ) : activeGateway === 'direct_upi' ? (
                <>
                  <span>I have paid ₹{book.price} via UPI / Bank</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Pay ₹{book.price} via Razorpay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 256-bit SSL Encrypted
              </span>
              <span>•</span>
              <span>Instant Digital Unlock</span>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Payment Successful!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Thank you! Your payment of <strong>₹{book.price}</strong> has been verified.
                <strong> "{book.title}"</strong> is now unlocked in your library!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-semibold">tx_{Date.now().toString().slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Access Type:</span>
                <span className="text-emerald-600 font-semibold">Lifetime Online Reading + PDF</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                setStep('review');
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
            >
              Start Reading in My Library
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
