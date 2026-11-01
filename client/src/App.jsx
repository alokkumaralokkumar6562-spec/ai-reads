import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PdfReaderModal from './components/PdfReaderModal';
import PaymentModal from './components/PaymentModal';
import AuthModal from './components/AuthModal';
import SearchModal from './components/SearchModal';

import HomePage from './pages/HomePage';
import AllBooksPage from './pages/AllBooksPage';
import AllNotesPage from './pages/AllNotesPage';
import FreeMaterialsPage from './pages/FreeMaterialsPage';
import PaidMaterialsPage from './pages/PaidMaterialsPage';
import BookDetailPage from './pages/BookDetailPage';
import AIAssistantPage from './pages/AIAssistantPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import MyLibraryPage from './pages/MyLibraryPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function AppContent() {
  const { user, token } = useAuth();

  // Active Modals state
  const [readerBook, setReaderBook] = useState(null);
  const [paymentBook, setPaymentBook] = useState(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Library cache state for fast UI sync
  const [savedBookIds, setSavedBookIds] = useState(new Set(['book-ai-01', 'note-college-01', 'note-py-02']));
  const [purchasedBookIds, setPurchasedBookIds] = useState(new Set(['book-ai-01', 'note-college-01']));

  // Sync user library
  useEffect(() => {
    if (token) {
      fetch('/api/library', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.library) {
            const saved = new Set();
            const purchased = new Set();
            data.library.forEach(item => {
              if (item.isSaved) saved.add(item.bookId);
              if (item.isPurchased) purchased.add(item.bookId);
            });
            setSavedBookIds(saved);
            setPurchasedBookIds(purchased);
          }
        })
        .catch(err => console.warn('Could not sync user library', err));
    }
  }, [token, user]);

  const handleToggleSave = async (bookId) => {
    if (!token) return;
    try {
      const res = await fetch('/api/library/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookId })
      });
      const data = await res.json();
      setSavedBookIds(prev => {
        const next = new Set(prev);
        if (data.saved) next.add(bookId);
        else next.delete(bookId);
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaymentSuccess = (book) => {
    setPurchasedBookIds(prev => new Set(prev).add(book.id));
    setSavedBookIds(prev => new Set(prev).add(book.id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar onOpenSearch={() => setSearchModalOpen(true)} />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onOpenReader={(b) => setReaderBook(b)}
                onOpenPayment={(b) => setPaymentBook(b)}
                onToggleSave={handleToggleSave}
                savedBookIds={savedBookIds}
                purchasedBookIds={purchasedBookIds}
              />
            }
          />
          <Route
            path="/books"
            element={
              <AllBooksPage
                onOpenReader={(b) => setReaderBook(b)}
                onOpenPayment={(b) => setPaymentBook(b)}
                onToggleSave={handleToggleSave}
                savedBookIds={savedBookIds}
                purchasedBookIds={purchasedBookIds}
              />
            }
          />
          <Route
            path="/notes"
            element={
              <AllNotesPage
                onOpenReader={(b) => setReaderBook(b)}
                onOpenPayment={(b) => setPaymentBook(b)}
                onToggleSave={handleToggleSave}
                savedBookIds={savedBookIds}
                purchasedBookIds={purchasedBookIds}
              />
            }
          />
          <Route
            path="/free"
            element={
              <FreeMaterialsPage
                onOpenReader={(b) => setReaderBook(b)}
                onToggleSave={handleToggleSave}
                savedBookIds={savedBookIds}
                purchasedBookIds={purchasedBookIds}
              />
            }
          />
          <Route
            path="/paid"
            element={
              <PaidMaterialsPage
                onOpenReader={(b) => setReaderBook(b)}
                onOpenPayment={(b) => setPaymentBook(b)}
                onToggleSave={handleToggleSave}
                savedBookIds={savedBookIds}
                purchasedBookIds={purchasedBookIds}
              />
            }
          />
          <Route
            path="/book/:id"
            element={
              <BookDetailPage
                onOpenReader={(b) => setReaderBook(b)}
                onOpenPayment={(b) => setPaymentBook(b)}
                onToggleSave={handleToggleSave}
                savedBookIds={savedBookIds}
                purchasedBookIds={purchasedBookIds}
              />
            }
          />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route
            path="/dashboard"
            element={
              <StudentDashboardPage
                onOpenReader={(b) => setReaderBook(b)}
                onOpenPayment={(b) => setPaymentBook(b)}
                onToggleSave={handleToggleSave}
                savedBookIds={savedBookIds}
                purchasedBookIds={purchasedBookIds}
              />
            }
          />
          <Route
            path="/library"
            element={
              <MyLibraryPage
                onOpenReader={(b) => setReaderBook(b)}
                onToggleSave={handleToggleSave}
              />
            }
          />
          <Route
            path="/orders"
            element={<MyOrdersPage onOpenReader={(b) => setReaderBook(b)} />}
          />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Modals */}
      <PdfReaderModal
        book={readerBook}
        isOpen={!!readerBook}
        onClose={() => setReaderBook(null)}
      />

      <PaymentModal
        book={paymentBook}
        isOpen={!!paymentBook}
        onClose={() => setPaymentBook(null)}
        onSuccess={handlePaymentSuccess}
      />

      <AuthModal />

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
