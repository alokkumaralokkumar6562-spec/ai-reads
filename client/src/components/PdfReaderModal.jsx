import React, { useState, useEffect } from 'react';
import {
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Maximize2, Minimize2, Sparkles, Volume2, VolumeX,
  Bookmark, Download, CheckCircle, HelpCircle, Loader2, BookOpen, Lock,
  Copy, Check, Code, Lightbulb, FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PdfReaderModal({ book, isOpen, onClose, isPurchased = false, onOpenPayment }) {
  const { user, token } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(100);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [themeMode, setThemeMode] = useState('day'); // 'day' | 'sepia' | 'night'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [activeAiTab, setActiveAiTab] = useState('summary'); // 'summary' | 'explain' | 'quiz'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pageData, setPageData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  const isPreviewOnly = Boolean(book && !book.isFree && !isPurchased);
  const maxAllowedPages = isPreviewOnly ? Math.min(3, book?.pages || 80) : (book?.pages || 80);

  useEffect(() => {
    if (book) {
      setTotalPages(book.pages || 80);
      setCurrentPage(1);
      setAiResponse('');
    }
  }, [book]);

  // Fetch verified subject-specific page content
  useEffect(() => {
    let isMounted = true;
    if (book && isOpen) {
      setPageLoading(true);
      fetch(`/api/books/${book.id}/page/${currentPage}`)
        .then(res => res.json())
        .then(data => {
          if (isMounted) {
            setPageData(data.page || null);
            setPageLoading(false);
          }
        })
        .catch(err => {
          console.warn('Error fetching book page:', err);
          if (isMounted) setPageLoading(false);
        });
    }
    return () => { isMounted = false; };
  }, [book, currentPage, isOpen]);

  // Sync progress to backend when reading
  useEffect(() => {
    if (book && user && token) {
      const progressPercent = Math.round((currentPage / totalPages) * 100);
      fetch('/api/library/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookId: book.id,
          progress: progressPercent,
          lastReadPage: currentPage
        })
      }).catch(err => console.warn('Failed to save reading progress', err));
    }
  }, [currentPage, book, user, token, totalPages]);

  if (!isOpen || !book) return null;

  // Reading themes
  const themeClasses = {
    day: 'bg-white text-slate-800 border-slate-200',
    sepia: 'bg-[#fbf0d9] text-[#5f4b32] border-[#ebd4b3]',
    night: 'bg-slate-900 text-slate-100 border-slate-800'
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  const handleNextPage = () => {
    if (isPreviewOnly && currentPage >= maxAllowedPages) {
      if (onOpenPayment) onOpenPayment(book);
      return;
    }
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  const copyCodeToClipboard = (code) => {
    if (navigator.clipboard && code) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Text to speech
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = isPreviewOnly
        ? `You are previewing sample page ${currentPage} of ${book.title}. Unlock the full book for rupees ${book.price} to listen to the complete audiobook and access all chapters.`
        : pageData
        ? `${pageData.heading}. ${pageData.body.slice(0, 350)}`
        : `${book.title}. Page ${currentPage}.`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // AI Quick Actions
  const runAiTool = async (type) => {
    setActiveAiTab(type);
    setAiSidebarOpen(true);
    setAiLoading(true);
    setAiResponse('');

    const pageContext = pageData
      ? `[Source: ${book.title} | ${pageData.chapter} | ${pageData.heading}]\n\n${pageData.body}`
      : `Core concepts for ${book.title} (${book.category})`;

    try {
      if (type === 'summary') {
        const res = await fetch('/api/ai/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `${book.title} - ${pageData?.heading || `Page ${currentPage}`}`,
            text: pageContext,
            chapterWise: false
          })
        });
        const data = await res.json();
        setAiResponse(data.summary);
      } else if (type === 'explain') {
        const res = await fetch('/api/ai/explain-bilingual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: pageData?.heading || `${book.category}: Key concepts in ${book.title}`,
            contextText: pageContext
          })
        });
        const data = await res.json();
        setAiResponse(`${data.english}\n\n---\n\n${data.hindi}`);
      } else if (type === 'quiz') {
        const res = await fetch('/api/ai/generate-mcqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: pageData?.heading || book.category,
            contextText: pageContext,
            count: 3
          })
        });
        const data = await res.json();
        const quizText = data.questions.map((q, idx) => `**Q${idx + 1}: ${q.question}**\n${q.options.map((opt, i) => `• ${opt} ${i === q.correctAnswer ? '✅ *(Correct)*' : ''}`).join('\n')}\n*Explanation: ${q.explanation}*\n`).join('\n---\n\n');
        setAiResponse(quizText);
      }
    } catch (err) {
      setAiResponse('Could not connect to AI Assistant. Please retry.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isFullscreen ? 'bg-black' : 'bg-slate-950/80 backdrop-blur-md p-2 sm:p-4'}`}>
      <div className={`relative flex-1 flex flex-col rounded-2xl overflow-hidden shadow-2xl border ${themeClasses[themeMode]} transition-colors duration-200`}>

        {/* Top Control Toolbar */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-inherit bg-inherit/90 backdrop-blur-md shrink-0">

          {/* Book Info */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 shrink-0">
              <BookOpen className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold truncate max-w-[200px] sm:max-w-md">
                  {book.title}
                </h3>
                {isPreviewOnly && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    <Lock className="w-2.5 h-2.5" /> Sample Preview (Pages 1-{maxAllowedPages})
                  </span>
                )}
              </div>
              <p className="text-[10px] opacity-70 truncate">
                {book.author} • {book.category}
              </p>
            </div>
          </div>

          {/* Reader Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Theme switcher */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg border border-inherit">
              <button
                onClick={() => setThemeMode('day')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${themeMode === 'day' ? 'bg-indigo-600 text-white' : 'hover:opacity-75'}`}
              >
                Day
              </button>
              <button
                onClick={() => setThemeMode('sepia')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${themeMode === 'sepia' ? 'bg-[#916b3f] text-white' : 'hover:opacity-75'}`}
              >
                Sepia
              </button>
              <button
                onClick={() => setThemeMode('night')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${themeMode === 'night' ? 'bg-slate-700 text-white' : 'hover:opacity-75'}`}
              >
                Night
              </button>
            </div>

            {/* Text to Speech */}
            <button
              onClick={toggleSpeech}
              className={`p-2 rounded-lg border border-inherit transition-colors ${isSpeaking ? 'bg-indigo-600 text-white animate-pulse' : 'hover:opacity-80'}`}
              title={isSpeaking ? 'Stop listening' : 'Listen with Audio Reader'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* AI Assistant Sidebar Toggle */}
            <button
              onClick={() => {
                setAiSidebarOpen(!aiSidebarOpen);
                if (!aiResponse) runAiTool('summary');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                aiSidebarOpen
                  ? 'bg-purple-600 text-white shadow-purple-600/30'
                  : 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 hover:bg-purple-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Study Copilot</span>
            </button>

            {/* Zoom Controls */}
            <div className="hidden md:flex items-center gap-1 border border-inherit rounded-lg px-1.5 py-1 text-xs">
              <button onClick={() => setZoomLevel(z => Math.max(70, z - 10))} title="Zoom Out">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-[10px] font-semibold">{zoomLevel}%</span>
              <button onClick={() => setZoomLevel(z => Math.min(150, z + 10))} title="Zoom In">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg border border-inherit hover:opacity-80 transition-opacity"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={() => {
                if (isSpeaking) window.speechSynthesis.cancel();
                onClose();
              }}
              className="p-2 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reader Body (Book Canvas + AI Sidebar) */}
        <div className="flex-1 flex overflow-hidden relative">

          {/* Main Book Page View */}
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-8 bg-black/5 dark:bg-black/20">
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className={`w-full max-w-2xl min-h-[680px] p-8 sm:p-12 rounded-xl shadow-2xl border border-inherit ${themeClasses[themeMode]} transition-transform duration-150 flex flex-col justify-between`}
            >
              <div>
                <div className="flex justify-between items-center text-[11px] uppercase tracking-widest opacity-60 pb-4 border-b border-inherit mb-6">
                  <span>{pageData?.category || book.category}</span>
                  <span className="font-mono">{pageData?.chapter || `Page ${currentPage} of ${totalPages}`}</span>
                </div>

                {isPreviewOnly && currentPage > maxAllowedPages ? (
                  <div className="py-12 px-4 text-center space-y-4 animate-in fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center shadow-lg shadow-indigo-600/10">
                      <Lock className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black">Full Study Material Locked</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                        You have reached the end of the free {maxAllowedPages}-page preview for <strong>"{book.title}"</strong>.
                        To read all {totalPages} pages, listen to continuous audio, and download the full PDF notes, complete the payment.
                      </p>
                    </div>

                    <div className="pt-4 max-w-xs mx-auto">
                      <button
                        onClick={() => onOpenPayment && onOpenPayment(book)}
                        className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                      >
                        <Lock className="w-4 h-4" />
                        Unlock Full Access for ₹{book.price}
                      </button>
                    </div>
                  </div>
                ) : pageLoading ? (
                  <div className="py-24 flex flex-col items-center justify-center gap-3 opacity-60">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    <span className="text-xs font-semibold">Loading verified syllabus content (Page {currentPage})...</span>
                  </div>
                ) : pageData ? (
                  <div className="space-y-4 text-xs sm:text-sm leading-relaxed animate-in fade-in duration-150">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {pageData.chapter}
                      </span>
                      <h2 className="text-lg sm:text-xl font-black mt-1 text-slate-900 dark:text-white">
                        {pageData.heading}
                      </h2>
                      <p className="text-[11px] font-semibold opacity-70 mt-0.5">
                        Source: {book.title} • By {book.author}
                      </p>
                    </div>

                    {/* Subject Content Paragraphs */}
                    <div className="whitespace-pre-line text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                      {pageData.body}
                    </div>

                    {/* Authentic Code Snippet with Copy Button */}
                    {pageData.codeSnippet && (
                      <div className="my-4 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 text-slate-100 shadow-lg">
                        <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px]">
                          <div className="flex items-center gap-1.5 text-indigo-400 font-mono font-bold">
                            <Code className="w-3.5 h-3.5" />
                            <span>{pageData.codeSnippet.language.toUpperCase()} IMPLEMENTATION</span>
                          </div>
                          <button
                            onClick={() => copyCodeToClipboard(pageData.codeSnippet.code)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors"
                          >
                            {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                          </button>
                        </div>
                        <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-emerald-400">
                          <code>{pageData.codeSnippet.code}</code>
                        </pre>
                      </div>
                    )}

                    {/* Key Subject Takeaways */}
                    {pageData.keyTakeaways && pageData.keyTakeaways.length > 0 && (
                      <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 my-4 space-y-2 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
                          <FileCheck className="w-4 h-4" />
                          <span>Core Syllabus Takeaways:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 pl-1">
                          {pageData.keyTakeaways.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* High-Yield Exam Tip */}
                    {pageData.examTip && (
                      <div className="p-3 rounded-lg border-l-4 border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 my-4 text-xs space-y-1">
                        <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>University Exam & Viva Tip:</span>
                        </p>
                        <p className="text-slate-700 dark:text-slate-300">{pageData.examTip}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-3">
                    <FileCheck className="w-10 h-10 mx-auto text-slate-400" />
                    <h3 className="font-bold text-sm">Verified Source Material in Digitization</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Page {currentPage} of "{book.title}" is currently being indexed from the publisher source. No placeholder text is displayed.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-inherit flex items-center justify-between text-xs opacity-60">
                <span>AI Reads Smart Learning Platform</span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>
            </div>
          </div>

          {/* AI Study Assistant Sidebar */}
          {aiSidebarOpen && (
            <div className="w-80 sm:w-96 border-l border-inherit bg-inherit flex flex-col shadow-2xl shrink-0 animate-in slide-in-from-right duration-200">
              {/* Sidebar Header */}
              <div className="p-3.5 border-b border-inherit flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Study Copilot</span>
                </div>
                <button
                  onClick={() => setAiSidebarOpen(false)}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tool tabs */}
              <div className="grid grid-cols-3 gap-1 p-2 border-b border-inherit bg-black/5 text-[11px] font-semibold">
                <button
                  onClick={() => runAiTool('summary')}
                  className={`py-1.5 rounded-lg text-center transition-colors ${activeAiTab === 'summary' ? 'bg-purple-600 text-white' : 'hover:opacity-75'}`}
                >
                  Summary
                </button>
                <button
                  onClick={() => runAiTool('explain')}
                  className={`py-1.5 rounded-lg text-center transition-colors ${activeAiTab === 'explain' ? 'bg-purple-600 text-white' : 'hover:opacity-75'}`}
                >
                  Bilingual
                </button>
                <button
                  onClick={() => runAiTool('quiz')}
                  className={`py-1.5 rounded-lg text-center transition-colors ${activeAiTab === 'quiz' ? 'bg-purple-600 text-white' : 'hover:opacity-75'}`}
                >
                  Mini Quiz
                </button>
              </div>

              {/* AI Content output */}
              <div className="flex-1 p-4 overflow-y-auto text-xs leading-relaxed space-y-3">
                {aiLoading ? (
                  <div className="h-48 flex flex-col items-center justify-center gap-3 text-purple-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <p className="text-xs font-medium">AI Copilot is analyzing page content...</p>
                  </div>
                ) : aiResponse ? (
                  <div className="whitespace-pre-wrap prose-sm">
                    {aiResponse}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Select an AI action above to analyze this book instantly!</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-inherit text-[10px] text-center opacity-60">
                Powered by AI Reads Study Intelligence
              </div>
            </div>
          )}
        </div>

        {/* Bottom Pagination Bar */}
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between border-t border-inherit bg-inherit/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-inherit hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-inherit hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Slider */}
          <div className="hidden sm:flex items-center gap-3 flex-1 max-w-xs mx-6">
            <input
              type="range"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono font-bold w-10 text-right">
              {Math.round((currentPage / totalPages) * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isPreviewOnly) {
                  if (onOpenPayment) onOpenPayment(book);
                } else {
                  alert(`Starting download for ${book.title}.pdf (Verified Lifetime Access)`);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all ${
                isPreviewOnly
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isPreviewOnly ? <Lock className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">
                {isPreviewOnly ? `Unlock to Download (₹${book.price})` : 'Download PDF'}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
