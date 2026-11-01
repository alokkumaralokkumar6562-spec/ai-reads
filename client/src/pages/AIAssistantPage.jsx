import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles, Upload, MessageSquare, FileText, CheckCircle2,
  HelpCircle, Languages, Trophy, Layers, Send, RefreshCw,
  Loader2, ArrowRight, Download, BookOpen, AlertCircle, Copy, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AIAssistantPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'chat');

  // PDF Upload State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [sampleBookTitle, setSampleBookTitle] = useState('Modern Artificial Intelligence: Theory & Practice');

  // 1. PDF Chatbot State
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your AI Study Copilot. Upload your notes/PDF above or ask any doubt about your syllabus, theorems, or code implementations.'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // 2. Summarizer State
  const [summaryInput, setSummaryInput] = useState('');
  const [chapterWise, setChapterWise] = useState(false);
  const [summaryOutput, setSummaryOutput] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  // 3. Short Notes State
  const [notesTopic, setNotesTopic] = useState('Operating System Deadlocks & Memory Paging');
  const [notesOutput, setNotesOutput] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);

  // 4. MCQ Quiz State
  const [mcqTopic, setMcqTopic] = useState('Data Structures & Algorithms');
  const [mcqs, setMcqs] = useState([]);
  const [mcqLoading, setMcqLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // 5. Bilingual Explainer State
  const [bilingualTopic, setBilingualTopic] = useState('Backpropagation & Gradient Descent in Deep Learning');
  const [bilingualOutput, setBilingualOutput] = useState(null);
  const [bilingualLang, setBilingualLang] = useState('english'); // 'english' | 'hindi'
  const [bilingualLoading, setBilingualLoading] = useState(false);

  // 6. Exam Questions State
  const [examTopic, setExamTopic] = useState('Database Management Systems (DBMS)');
  const [examOutput, setExamOutput] = useState([]);
  const [examLoading, setExamLoading] = useState(false);

  // 7. Flashcards State
  const [flashcardTopic, setFlashcardTopic] = useState('Computer Networks & Protocols');
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardLoading, setFlashcardLoading] = useState(false);

  // 8. Text-to-Notes State
  const [rawLectureText, setRawLectureText] = useState(
    'A binary search tree is a rooted binary tree whose internal nodes each store a key. For any node N, all keys in left subtree are smaller than N, and all keys in right subtree are greater than N. Searching takes O(h) where h is the tree height. If unbalanced it degrades to O(n).'
  );
  const [textNotesOutput, setTextNotesOutput] = useState('');
  const [textNotesLoading, setTextNotesLoading] = useState(false);

  // Handle PDF file selection
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await fetch('/api/ai/upload-pdf', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUploadedFile({
        name: data.fileName,
        pages: data.pages,
        preview: data.preview
      });
      setExtractedText(data.sampleText || data.preview);
      setSampleBookTitle(data.fileName);
    } catch (err) {
      alert('PDF upload error: ' + err.message);
    } finally {
      setUploadingPdf(false);
    }
  };

  // 1. Ask PDF Chatbot
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userQ = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userQ }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/ask-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQ,
          contextText: extractedText || 'Standard engineering textbooks and syllabus knowledge.',
          bookTitle: sampleBookTitle,
          userId: user?.id
        })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', text: data.answer }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Error generating response. Please retry.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // 2. Run Summarizer
  const handleSummarize = async () => {
    setSummaryLoading(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: sampleBookTitle,
          text: summaryInput || extractedText || 'Core concepts of academic curriculum.',
          chapterWise,
          userId: user?.id
        })
      });
      const data = await res.json();
      setSummaryOutput(data.summary);
    } catch (err) {
      setSummaryOutput('Failed to generate summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  // 3. Generate Notes
  const handleGenerateNotes = async () => {
    setNotesLoading(true);
    try {
      const res = await fetch('/api/ai/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: notesTopic, userId: user?.id })
      });
      const data = await res.json();
      setNotesOutput(data.notes);
    } catch (err) {
      setNotesOutput('Failed to generate notes.');
    } finally {
      setNotesLoading(false);
    }
  };

  // 4. Generate MCQs
  const handleGenerateMcqs = async () => {
    setMcqLoading(true);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    try {
      const res = await fetch('/api/ai/generate-mcqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: mcqTopic, count: 5, userId: user?.id })
      });
      const data = await res.json();
      setMcqs(data.questions || []);
    } catch (err) {
      alert('Failed to generate MCQs');
    } finally {
      setMcqLoading(false);
    }
  };

  // 5. Bilingual Explain
  const handleBilingualExplain = async () => {
    setBilingualLoading(true);
    try {
      const res = await fetch('/api/ai/explain-bilingual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: bilingualTopic, userId: user?.id })
      });
      const data = await res.json();
      setBilingualOutput(data);
    } catch (err) {
      alert('Failed to generate explanation');
    } finally {
      setBilingualLoading(false);
    }
  };

  // 6. Exam Questions
  const handleExamQuestions = async () => {
    setExamLoading(true);
    try {
      const res = await fetch('/api/ai/exam-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: examTopic, userId: user?.id })
      });
      const data = await res.json();
      setExamOutput(data.questions || []);
    } catch (err) {
      alert('Failed to generate questions');
    } finally {
      setExamLoading(false);
    }
  };

  // 7. Flashcards
  const handleGenerateFlashcards = async () => {
    setFlashcardLoading(true);
    setIsFlipped(false);
    setCurrentCardIndex(0);
    try {
      const res = await fetch('/api/ai/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: flashcardTopic, userId: user?.id })
      });
      const data = await res.json();
      setFlashcards(data.flashcards || []);
    } catch (err) {
      alert('Failed to generate flashcards');
    } finally {
      setFlashcardLoading(false);
    }
  };

  // 8. Text to notes
  const handleTextToNotes = async () => {
    setTextNotesLoading(true);
    try {
      const res = await fetch('/api/ai/text-to-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: rawLectureText, title: 'Lecture Notes', userId: user?.id })
      });
      const data = await res.json();
      setTextNotesOutput(data.formattedNotes);
    } catch (err) {
      alert('Failed to convert text');
    } finally {
      setTextNotesLoading(false);
    }
  };

  const tabs = [
    { id: 'chat', label: 'PDF Chatbot', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'summarize', label: 'Summarizer', icon: <FileText className="w-4 h-4" /> },
    { id: 'notes', label: 'Short Notes', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'mcq', label: 'MCQ Quiz', icon: <Trophy className="w-4 h-4" /> },
    { id: 'bilingual', label: 'Bilingual Explainer', icon: <Languages className="w-4 h-4" /> },
    { id: 'exam', label: 'Exam Questions', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Layers className="w-4 h-4" /> },
    { id: 'text2notes', label: 'Text-to-Notes', icon: <BookOpen className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

      {/* Header Banner */}
      <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-purple-200 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            AI Study Copilot Suite
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            AI-Powered Academic Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Upload PDFs, extract instant summaries, generate timed practice MCQs, produce cheat sheets, and explain complex engineering theorems in simple English & Hindi.
          </p>
        </div>

        {/* Global PDF Context Uploader */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs space-y-3 shrink-0 sm:w-80">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-purple-200">
              <Upload className="w-4 h-4" /> Active Context PDF
            </span>
            {uploadedFile && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500 text-white font-bold">
                Loaded
              </span>
            )}
          </div>

          {uploadedFile ? (
            <div className="p-2.5 rounded-xl bg-black/20 text-[11px] truncate">
              <p className="font-bold text-white truncate">{uploadedFile.name}</p>
              <p className="text-purple-300">{uploadedFile.pages} Pages Analyzed</p>
            </div>
          ) : (
            <p className="text-[11px] text-slate-300">
              Analyzing: <strong>{sampleBookTitle}</strong>
            </p>
          )}

          <label className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-center block cursor-pointer transition-colors shadow-sm text-xs">
            {uploadingPdf ? 'Analyzing PDF...' : 'Upload Custom PDF'}
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: PDF CHATBOT */}
      {activeTab === 'chat' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[600px]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 max-w-2xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-purple-600 text-white'
                }`}>
                  {msg.role === 'user' ? 'You' : <Sparkles className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-3 max-w-md">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-purple-600 dark:text-purple-300 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Copilot is formulating answer...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything about the book, proofs, algorithms, or definitions..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: SUMMARIZER */}
      {activeTab === 'summarize' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" /> Document Summarizer
            </h3>
            <p className="text-xs text-slate-500">
              Paste long textbook excerpts or use the text from your uploaded PDF.
            </p>

            <textarea
              rows={8}
              value={summaryInput}
              onChange={(e) => setSummaryInput(e.target.value)}
              placeholder="Paste chapters, paragraphs, or syllabus content to summarize..."
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={chapterWise}
                  onChange={(e) => setChapterWise(e.target.checked)}
                  className="accent-indigo-600 rounded"
                />
                <span>Generate Chapter-Wise Breakdown</span>
              </label>

              <button
                onClick={handleSummarize}
                disabled={summaryLoading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {summaryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Summarize Now
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 min-h-[380px]">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Executive AI Summary
            </h3>
            {summaryLoading ? (
              <div className="py-20 text-center text-purple-600 flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs">Distilling key takeaways & chapter formulas...</span>
              </div>
            ) : summaryOutput ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {summaryOutput}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">
                Click "Summarize Now" to generate an instant executive brief.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SHORT NOTES */}
      {activeTab === 'notes' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="max-w-xl space-y-2">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" /> Short Notes & Formula Sheets
            </h3>
            <p className="text-xs text-slate-500">
              Generate high-yield college notes with formulas, mnemonics, and definitions ready for print.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={notesTopic}
              onChange={(e) => setNotesTopic(e.target.value)}
              placeholder="e.g. Cache Memory Mapping or Convolutional Neural Networks"
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
            />
            <button
              onClick={handleGenerateNotes}
              disabled={notesLoading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
            >
              {notesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Notes
            </button>
          </div>

          {notesOutput && (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap relative group">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(notesOutput);
                  alert('Notes copied to clipboard!');
                }}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1 shadow-sm"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
              {notesOutput}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MCQ QUIZ GENERATOR */}
      {activeTab === 'mcq' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> Interactive MCQ Quiz Generator
              </h3>
              <p className="text-xs text-slate-500">
                Practice topic-wise exam questions with instant scoring and explanations.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={mcqTopic}
                onChange={(e) => setMcqTopic(e.target.value)}
                placeholder="Subject or topic..."
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
              <button
                onClick={handleGenerateMcqs}
                disabled={mcqLoading}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                {mcqLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Generate 5 MCQs
              </button>
            </div>
          </div>

          {mcqs.length > 0 ? (
            <div className="space-y-6">
              {mcqs.map((q, qIndex) => {
                const userAns = selectedAnswers[q.id];
                const isAnswered = userAns !== undefined;
                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3"
                  >
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      Q{qIndex + 1}. {q.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIndex) => {
                        let btnStyle = 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800';
                        if (quizSubmitted) {
                          if (optIndex === q.correctAnswer) {
                            btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold';
                          } else if (userAns === optIndex) {
                            btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300';
                          }
                        } else if (userAns === optIndex) {
                          btnStyle = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold';
                        }

                        return (
                          <button
                            key={optIndex}
                            onClick={() => {
                              if (!quizSubmitted) {
                                setSelectedAnswers(prev => ({ ...prev, [q.id]: optIndex }));
                              }
                            }}
                            className={`p-3 rounded-xl border text-xs text-left transition-colors flex items-center gap-2 ${btnStyle}`}
                          >
                            <span className="w-5 h-5 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 text-xs text-indigo-900 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-900">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              {!quizSubmitted ? (
                <button
                  onClick={() => setQuizSubmitted(true)}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Submit & Check Score
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between">
                  <span>
                    Your Score:{' '}
                    {mcqs.filter(q => selectedAnswers[q.id] === q.correctAnswer).length} / {mcqs.length} Correct
                  </span>
                  <button
                    onClick={handleGenerateMcqs}
                    className="underline hover:text-emerald-600"
                  >
                    Try Another Quiz
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-14 text-center text-xs text-slate-400">
              Click "Generate 5 MCQs" above to start an interactive test session.
            </div>
          )}
        </div>
      )}

      {/* TAB 5: BILINGUAL EXPLAINER */}
      {activeTab === 'bilingual' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="max-w-xl space-y-1">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Languages className="w-5 h-5 text-indigo-500" /> Bilingual Concept Explainer (English + Hindi)
            </h3>
            <p className="text-xs text-slate-500">
              Simplifies heavy jargon with everyday relatable analogies and bilingual switcher.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={bilingualTopic}
              onChange={(e) => setBilingualTopic(e.target.value)}
              placeholder="e.g. Virtual Memory Paging or Transformer Attention"
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
            />
            <button
              onClick={handleBilingualExplain}
              disabled={bilingualLoading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
            >
              {bilingualLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Explain Simply
            </button>
          </div>

          {bilingualOutput && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBilingualLang('english')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${bilingualLang === 'english' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
                >
                  🇬🇧 Simple English Explanation
                </button>
                <button
                  onClick={() => setBilingualLang('hindi')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${bilingualLang === 'hindi' ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
                >
                  🇮🇳 आसान हिंदी (Hinglish)
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {bilingualLang === 'english' ? bilingualOutput.english : bilingualOutput.hindi}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: IMPORTANT EXAM QUESTIONS */}
      {activeTab === 'exam' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-500" /> Important Exam Questions (2M, 5M & 10M)
              </h3>
              <p className="text-xs text-slate-500">
                Categorized questions with step-by-step model answers and marks allotment.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={examTopic}
                onChange={(e) => setExamTopic(e.target.value)}
                placeholder="e.g. Operating Systems"
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
              <button
                onClick={handleExamQuestions}
                disabled={examLoading}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                {examLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Predict Questions
              </button>
            </div>
          </div>

          {examOutput.length > 0 ? (
            <div className="space-y-4">
              {examOutput.map((q, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {q.marks}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{q.question}</h4>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    <strong>Model Answer:</strong>
                    <br />
                    {q.modelAnswer}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center text-xs text-slate-400">
              Click "Predict Questions" to generate expected university exam questions.
            </div>
          )}
        </div>
      )}

      {/* TAB 7: FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" /> 3D Interactive Memory Flashcards
              </h3>
              <p className="text-xs text-slate-500">
                Click to flip and test your active recall retention before tests.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={flashcardTopic}
                onChange={(e) => setFlashcardTopic(e.target.value)}
                placeholder="Topic..."
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
              <button
                onClick={handleGenerateFlashcards}
                disabled={flashcardLoading}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                {flashcardLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Generate Deck
              </button>
            </div>
          </div>

          {flashcards.length > 0 ? (
            <div className="max-w-xl mx-auto space-y-4">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-72 rounded-3xl cursor-pointer p-8 flex flex-col justify-between shadow-xl transition-all duration-300 border border-indigo-200 dark:border-indigo-900 bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-transparent text-center select-none"
              >
                <div className="flex justify-between items-center text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                  <span>Card {currentCardIndex + 1} of {flashcards.length}</span>
                  <span>{isFlipped ? 'Answer (Click to flip)' : 'Question (Click to flip)'}</span>
                </div>

                <div className="flex items-center justify-center text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                  {isFlipped ? flashcards[currentCardIndex].back : flashcards[currentCardIndex].front}
                </div>

                <p className="text-[11px] text-slate-400">
                  {isFlipped ? '🔄 Showing Solution' : '💡 Tap anywhere to reveal definition'}
                </p>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex(i => Math.max(0, i - 1));
                  }}
                  disabled={currentCardIndex === 0}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40"
                >
                  Previous Card
                </button>

                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-xs font-bold"
                >
                  Flip Card
                </button>

                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex(i => Math.min(flashcards.length - 1, i + 1));
                  }}
                  disabled={currentCardIndex === flashcards.length - 1}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40"
                >
                  Next Card
                </button>
              </div>
            </div>
          ) : (
            <div className="py-14 text-center text-xs text-slate-400">
              Click "Generate Deck" above to generate a 5-card flashcard set.
            </div>
          )}
        </div>
      )}

      {/* TAB 8: TEXT TO NOTES */}
      {activeTab === 'text2notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" /> Text-to-Notes Synthesizer
            </h3>
            <p className="text-xs text-slate-500">
              Paste raw spoken lecture transcripts or messy bullet points to convert them into formatted notes.
            </p>

            <textarea
              rows={8}
              value={rawLectureText}
              onChange={(e) => setRawLectureText(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
            />

            <button
              onClick={handleTextToNotes}
              disabled={textNotesLoading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {textNotesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Format Clean Notes
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 min-h-[380px]">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Synthesized Revision Notes
            </h3>
            {textNotesOutput ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {textNotesOutput}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">
                Click "Format Clean Notes" to generate the structured markdown note.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
