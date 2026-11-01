import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Send, Heart, Mail, Phone, MapPin, ShieldCheck, Check } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">

          {/* Col 1: Brand & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                AI Reads
              </span>
            </Link>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
              <strong className="text-indigo-400">Read Smarter. Learn Faster. Grow Better.</strong>
              <br />
              India's premier smart learning platform empowering engineering and college students with curated notes, standard textbooks, and cutting-edge AI study tools.
            </p>

            {/* Direct Helpline Badge */}
            <div className="pt-1 text-xs space-y-1.5 text-slate-400">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-white font-medium">
                  {siteConfig.contact.phone}
                </a>
                <span className="text-slate-600">•</span>
                <a
                  href={`https://wa.me/${siteConfig.contact.whatsapp}?text=Hi%20Alok%20Sir,%20I%20have%20a%20query%20about%20AI%20Reads`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  WhatsApp Chat
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white font-medium">
                  {siteConfig.contact.email}
                </a>
              </p>
            </div>

            {/* Newsletter */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
                Get Weekly High-Yield Study Materials
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your student email..."
                  required
                  className="bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 flex-1"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {subscribed ? <Check className="w-4 h-4 text-emerald-400" /> : <Send className="w-3.5 h-3.5" />}
                  {subscribed ? 'Subscribed!' : 'Join Free'}
                </button>
              </form>
            </div>
          </div>

          {/* Col 2: Top Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wide">
              Popular Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/books?category=Artificial Intelligence" className="hover:text-indigo-400 transition-colors">Artificial Intelligence</Link></li>
              <li><Link to="/books?category=Machine Learning" className="hover:text-indigo-400 transition-colors">Machine Learning & DL</Link></li>
              <li><Link to="/books?category=Data Science" className="hover:text-indigo-400 transition-colors">Data Science & Stats</Link></li>
              <li><Link to="/books?category=Python Programming" className="hover:text-indigo-400 transition-colors">Python & Java Coding</Link></li>
              <li><Link to="/books?category=Database Management System" className="hover:text-indigo-400 transition-colors">Database Systems (DBMS)</Link></li>
              <li><Link to="/books?category=Operating System" className="hover:text-indigo-400 transition-colors">Operating Systems & CN</Link></li>
            </ul>
          </div>

          {/* Col 3: AI Tools & Learning */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" /> AI Study Tools
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/ai-assistant?tab=chat" className="hover:text-purple-400 transition-colors">Upload PDF & Ask Questions</Link></li>
              <li><Link to="/ai-assistant?tab=summary" className="hover:text-purple-400 transition-colors">Smart Document Summarizer</Link></li>
              <li><Link to="/ai-assistant?tab=mcq" className="hover:text-purple-400 transition-colors">Interactive MCQ Generator</Link></li>
              <li><Link to="/ai-assistant?tab=bilingual" className="hover:text-purple-400 transition-colors">Hindi & English Concept Explainer</Link></li>
              <li><Link to="/ai-assistant?tab=exam" className="hover:text-purple-400 transition-colors">Important Exam Questions</Link></li>
              <li><Link to="/ai-assistant?tab=flashcards" className="hover:text-purple-400 transition-colors">3D Revision Flashcards</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform & Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wide">
              Quick Links & Support
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/free" className="hover:text-emerald-400 text-emerald-400/90 font-medium transition-colors">100% Free Materials</Link></li>
              <li><Link to="/paid" className="hover:text-amber-400 text-amber-400/90 font-medium transition-colors">Affordable Notes (₹49 - ₹199)</Link></li>
              <li><Link to="/about" className="hover:text-indigo-400 transition-colors">About AI Reads</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact Support & FAQ</Link></li>
              <li><Link to="/dashboard" className="hover:text-indigo-400 transition-colors">Student Dashboard</Link></li>
              <li><Link to="/admin" className="hover:text-indigo-400 transition-colors">Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} AI Reads. Operated by Alok Kumar.</p>
          <div className="flex items-center gap-6 text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Razorpay Verified 256-bit Secure
            </span>
            <Link to="/contact" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
