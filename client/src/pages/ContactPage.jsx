import React, { useState } from 'react';
import {
  Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2,
  Users, HelpCircle, Sparkles, Building, CreditCard
} from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Study Material Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: 'Study Material Inquiry', message: '' });
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Get in Touch & Support
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
          We're Here to Help You Succeed
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Have questions about notes, payment verification, custom university syllabus notes, or student partnerships?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Contact Info & Channels */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-indigo-900 text-white shadow-xl space-y-6">
            <h3 className="font-extrabold text-xl">Direct Student Support</h3>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Our academic coordinators and technical team are available Monday through Saturday (9 AM - 8 PM IST).
            </p>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Email Us</p>
                  <a href={`mailto:${siteConfig.contact.email}`} className="font-semibold text-white hover:underline">
                    {siteConfig.contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Helpline & WhatsApp</p>
                  <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} target="_blank" rel="noreferrer" className="font-semibold text-white hover:underline">
                    {siteConfig.contact.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Headquarters</p>
                  <p className="font-semibold text-white">{siteConfig.contact.address}</p>
                </div>
              </div>
            </div>

            {/* Direct Bank & UPI Support details */}
            <div className="pt-4 border-t border-white/15 space-y-2 text-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-purple-200 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> Official Bank / UPI for Direct Transfers:
              </p>
              <div className="p-3 rounded-xl bg-white/10 space-y-1 font-mono text-[11px]">
                <p><strong>A/C Name:</strong> {siteConfig.banking.accountHolderName}</p>
                <p><strong>A/C No:</strong> {siteConfig.banking.accountNumber}</p>
                <p><strong>IFSC:</strong> {siteConfig.banking.ifscCode} ({siteConfig.banking.bankName})</p>
                <p><strong>UPI ID:</strong> <span className="text-emerald-300 font-bold">{siteConfig.banking.upiId}</span></p>
              </div>
            </div>

            {/* Social Communities */}
            <div className="pt-2 border-t border-white/15 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-purple-200">
                Join Active Student Communities:
              </p>
              <div className="flex gap-2 text-xs">
                <a
                  href={`https://wa.me/${siteConfig.contact.whatsapp}?text=Hi%20AI%20Reads%20Support`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold transition-colors flex items-center gap-1"
                >
                  WhatsApp Chat
                </a>
                <a
                  href={siteConfig.socialLinks.telegramChannel}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 font-semibold transition-colors flex items-center gap-1"
                >
                  Telegram Channel
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
            Send Us a Message
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Fill out the details below and we will respond within 4 hours.
          </p>

          {submitted ? (
            <div className="p-8 text-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 space-y-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-base">Message Sent Successfully!</h4>
              <p className="text-xs">Thank you for reaching out. A student advisor has received your request.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Aryan Verma"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="aryan@college.edu"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topic of Inquiry
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option>Study Material Inquiry</option>
                  <option>Payment & Razorpay Order Assistance</option>
                  <option>Upload My Handwritten Notes (Contributor Program)</option>
                  <option>AI Assistant Feedback & Questions</option>
                  <option>Campus Ambassador Application</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your question or how we can assist..."
                  className="w-full p-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
