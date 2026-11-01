import React, { useState, useEffect } from 'react';
import {
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Maximize2, Minimize2, Sparkles, Volume2, VolumeX,
  Bookmark, Download, CheckCircle, HelpCircle, Loader2, BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PdfReaderModal({ book, isOpen, onClose }) {
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

  useEffect(() => {
    if (book) {
      setTotalPages(book.pages || 80);
      setCurrentPage(1);
      setAiResponse('');
    }
  }, [book]);

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
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
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
      const textToRead = `${book.title}. Chapter ${Math.ceil(currentPage / 10)}. In this section, we examine core computational foundations, theoretical invariants, and algorithm efficiency.`;
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

    try {
      if (type === 'summary') {
        const res = await fetch('/api/ai/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `${book.title} (Page ${currentPage})`,
            text: `Core concepts on page ${currentPage} of ${book.title}. Discussing standard algorithms, memory usage, and practical formulas.`,
            chapterWise: false
          })
        });
        const data = await res.json();
        setAiResponse(data.summary);
      } else if (type === 'explain') {
        const res = await fetch('/api/ai/explain-bilingual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: `${book.category}: Key concepts in ${book.title}` })
        });
        const data = await res.json();
        setAiResponse(`${data.english}\n\n---\n\n${data.hindi}`);
      } else if (type === 'quiz') {
        const res = await fetch('/api/ai/generate-mcqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: book.category, count: 3 })
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
              <h3 className="text-xs sm:text-sm font-bold truncate max-w-[200px] sm:max-w-md">
                {book.title}
              </h3>
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
                  <span>{book.category}</span>
                  <span>Chapter {Math.ceil(currentPage / 10)}: Foundations</span>
                </div>

                <h1 className="text-2xl font-black mb-4">
                  {book.title}
                </h1>
                <p className="text-xs font-semibold opacity-70 mb-6">
                  By {book.author} • Academic Digital Edition
                </p>

                <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
                  <p>
                    <strong>Section {currentPage}.1: Fundamental Theorems & Structural Invariants</strong>
                  </p>
                  <p>
                    In modern computational science and software engineering, mastering asymptotic bounds requires verifying state preconditions prior to executing non-linear state transitions. Whether optimizing relational indices or deploying deep neural pipelines, efficiency bounds remain bounded by deterministic principles.
                  </p>

                  <div className="p-4 rounded-xl bg-inherit border border-inherit my-4 font-mono text-xs shadow-inner">
                    <p className="text-indigo-600 dark:text-indigo-400 font-bold mb-1">// Algorithm Invariant Definition</p>
                    <p>Invariant(State S): for each node v in Graph G: d[v] &le; d[u] + w(u, v)</p>
                    <p>Complexity: O(|V| log |V| + |E|)</p>
                  </div>

                  <p>
                    During university examinations and competitive interviews, students frequently fail to declare loop termination criteria. Always prove that with each recursive reduction step, the problem strictly monotonically decreases towards the known base case.
                  </p>

                  <div className="p-3 rounded-lg border-l-4 border-indigo-500 bg-indigo-50/20 my-4 text-xs">
                    <p className="font-bold">Key Exam Takeaway:</p>
                    <p>Maintain consistent notation and explicitly state assumptions when formulating mathematical proofs or code walkthroughs.</p>
                  </div>
                </div>
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
              onClick={() => alert(`Starting download for ${book.title}.pdf (Verified)`)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
