import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X, ShieldCheck, CheckCircle2, Lock, CreditCard,
  Smartphone, Zap, AlertCircle, ArrowRight, Loader2, Building, Copy, Check, MessageSquare
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { siteConfig } from './config/siteConfig';
import { ordersAPI } from './api';

/**
 * AI Reads Secure Razorpay Checkout Component
 * - Creates orders strictly on the backend
 * - Requires cryptographic server-side HMAC-SHA256 signature verification
 * - Eliminates all fake client-side success and auto-unlock bypasses
 * - Displays verified Razorpay payment IDs (no fake IDs)
 * - Uses Razorpay Test Mode with full test card / UPI support
 */
export default function Checkout({ book, isOpen = true, onClose, onSuccess }) {
  const { user, token, openAuthModal } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('review'); // 'review' | 'success'
  const [activeGateway, setActiveGateway] = useState('razorpay'); // 'razorpay' | 'direct_upi'
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState({ isLiveConfigured: false, isDummyKey: true, keyId: '' });
  const [verifiedOrder, setVerifiedOrder] = useState(null);

  // Fetch Razorpay public key ID and mode on mount (Never exposes secrets)
  useEffect(() => {
    let isMounted = true;
    ordersAPI.getConfig()
      .then((cfg) => {
        if (isMounted && cfg) {
          setPaymentConfig(cfg);
        }
      })
      .catch((err) => {
        console.warn('[Checkout] Could not load payment config:', err.message);
      });
    return () => { isMounted = false; };
  }, []);

  if (!isOpen || !book) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const copyText = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  // Helper to dynamically load Razorpay checkout script if not present
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existingScript) {
        if (window.Razorpay) return resolve(true);
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    // 1. Verify user is authenticated
    if (!user || !token) {
      setError('Please log in to proceed with checkout.');
      if (onClose) onClose();
      openAuthModal('login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Direct UPI Manual Flow (DOES NOT AUTO-UNLOCK: Requires WhatsApp receipt submission)
      if (activeGateway === 'direct_upi') {
        setLoading(false);
        const waUrl = `https://wa.me/917209092757?text=Hi%20Alok%20Sir,%20I%20have%20paid%20Rs%20${book.price}%20via%20PhonePe/UPI%20for%20"${encodeURIComponent(book.title)}"%20(Account:%20${user.email}).%20Please%20verify%20and%20activate%20access.`;
        window.open(waUrl, '_blank');
        return;
      }

      // Check if Razorpay keys are configured
      if (paymentConfig.isDummyKey || !paymentConfig.isLiveConfigured) {
        setLoading(false);
        setError('Razorpay Merchant Account connected nahi hai. Real payment accept karne ke liye server/.env me Razorpay Key ID aur Secret daalein, ya fir "Direct UPI / QR" select karein.');
        return;
      }

      // 2. Create Order ONLY on the Backend (order status = 'created', content remains locked)
      const orderData = await ordersAPI.createOrder(book.id);

      if (!orderData || !orderData.orderId) {
        throw new Error('Failed to create order on payment gateway. Please retry.');
      }

      // 3. Load Razorpay SDK
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded || !window.Razorpay) {
        throw new Error('Unable to load Razorpay Checkout SDK. Please check your internet connection or ad-blocker.');
      }

      let keyId = paymentConfig.keyId;

      // 4. Open Razorpay Official checkout popup
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'AI Reads Learning Platform',
        description: `Access to ${book.title}`,
        order_id: orderData.orderId,
        prefill: {
          name: user.name || 'AI Reads Learner',
          email: user.email || 'learner@aireads.com',
        },
        theme: {
          color: '#6366f1'
        },
        handler: async (response) => {
          // Cryptographically verified on backend before any unlock occurs
          await verifyOrderPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookId: book.id
          });
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment was not completed. Transaction cancelled.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        console.error('[Razorpay Payment Failed]', resp.error);
        setLoading(false);
        setError(`Payment Failed: ${resp.error.description || 'Payment was declined or cancelled.'}`);
      });

      rzp.open();
    } catch (err) {
      console.error('[Checkout Initiation Error]', err);
      if (err.isAuthExpired || err.status === 401 || /token/i.test(err.message)) {
        setError('Your session has expired. Redirecting to login...');
        setTimeout(() => {
          if (onClose) onClose();
          openAuthModal('login');
        }, 1200);
      } else if (err.isNetworkError || err.message === 'Load failed' || err.message === 'Failed to fetch' || /load failed|failed to fetch/i.test(err.message)) {
        setError('Server se sampark nahi ho pa raha hai (Backend server unreachable). Kripya check karein ki server chal raha hai.');
      } else {
        setError(err.message || 'Payment initiation failed. Please try again.');
      }
      setLoading(false);
    }
  };

  /**
   * Secure Server-Side Payment Verification
   * Unlocks product ONLY when server confirms cryptographic HMAC-SHA256 signature
   */
  const verifyOrderPayment = async (payload) => {
    try {
      setLoading(true);
      setError('');

      const data = await ordersAPI.verifyPayment(payload);

      if (!data.success || !data.order) {
        throw new Error(data.error || 'Payment verification failed on the server.');
      }

      // Store verified order and update UI to success
      setVerifiedOrder(data.order);
      setLoading(false);
      setStep('success');
      triggerConfetti();

      if (onSuccess) {
        onSuccess(book, data.order);
      }
    } catch (err) {
      console.error('[Payment Verification Security Rejection]', err);
      setLoading(false);

      if (err.isAuthExpired || err.status === 401 || /token/i.test(err.message)) {
        setError('Your session has expired. Redirecting to login...');
        setTimeout(() => {
          if (onClose) onClose();
          openAuthModal('login');
        }, 1200);
      } else if (err.isNetworkError || err.message === 'Load failed' || err.message === 'Failed to fetch' || /load failed|failed to fetch/i.test(err.message)) {
        setError('Payment verification network error. Server se sampark nahi ho saka.');
      } else {
        setError(err.message || 'Payment verification failed. Access not granted.');
      }
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
              Razorpay 256-bit Secure Checkout
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
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
                  <span>Digital PDF + Lifetime Reader Access</span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">₹{book.price}</span>
                </div>
              </div>
            </div>

            {/* Payment Gateway Toggle: Razorpay vs Direct UPI */}
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
                  ⚡ Razorpay Gateway (Instant)
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
                  Direct UPI / QR
                </button>
              </div>
            </div>

            {/* Direct UPI Payment Details View */}
            {activeGateway === 'direct_upi' ? (
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200">Pay via PhonePe / GPay / Paytm:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black text-sm">₹{book.price}</span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Official UPI ID:</span>
                    <p className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">{siteConfig.banking.upiId}</p>
                    <p className="text-[10px] text-slate-400">Payee Name: {siteConfig.banking.accountHolderName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(siteConfig.banking.upiId)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedUpi ? 'Copied!' : 'Copy UPI'}
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                  💡 <strong>Direct Bank Transfer:</strong> PhonePe ya GPay se is UPI par ₹{book.price} bhejkar WhatsApp par screenshot send karein. Verification ke baad book library me unlock ho jayegi.
                </div>
              </div>
            ) : (
              <>
                {/* Razorpay not connected notice */}
                {(paymentConfig.isDummyKey || !paymentConfig.isLiveConfigured) && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Razorpay Merchant Keys Required</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Bank se real payment lene ke liye <code>server/.env</code> me apni Razorpay Key ID aur Secret daalein. Tab tak aap direct payment ke liye <strong>Direct UPI / QR</strong> tab select karein.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveGateway('direct_upi')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Switch to Direct UPI / QR Pay</span>
                    </button>
                  </div>
                )}

                {/* Pricing Breakdown */}
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
              </>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
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
                  Connecting Gateway...
                </>
              ) : activeGateway === 'direct_upi' ? (
                <>
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Payment Screenshot on WhatsApp</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{book.price} via Razorpay (Instant Access)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 256-bit SSL Encrypted
              </span>
              <span>•</span>
              <span>Server-Verified Unlock</span>
            </div>
          </div>
        ) : (
          /* Success Screen (Shown ONLY after server cryptographic verification) */
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Payment Verified & Unlocked!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Thank you! Your payment of <strong>₹{book.price}</strong> has been cryptographically verified by the server.
                <strong> "{book.title}"</strong> is now permanently unlocked in your library!
              </p>
            </div>

            {/* Verified Transaction Details (No fake IDs) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Payment ID:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {verifiedOrder?.razorpayPaymentId || verifiedOrder?.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono font-semibold text-slate-600 dark:text-slate-400">
                  {verifiedOrder?.razorpayOrderId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-emerald-600">Captured & Verified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Access:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Lifetime Online Reader + PDF</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (onClose) onClose();
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
