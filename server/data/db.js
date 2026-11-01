import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'store.json');

export const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Artificial Intelligence', icon: 'Bot', count: 18, description: 'Neural networks, agents, NLP, and modern AI algorithms' },
  { id: 'cat-2', name: 'Machine Learning', icon: 'BrainCircuit', count: 24, description: 'Supervised, unsupervised, regression, and practical pipelines' },
  { id: 'cat-3', name: 'Deep Learning', icon: 'Cpu', count: 16, description: 'CNNs, RNNs, Transformers, and PyTorch/TensorFlow guides' },
  { id: 'cat-4', name: 'Data Science', icon: 'BarChart3', count: 21, description: 'EDA, Pandas, NumPy, statistical modeling, and visualization' },
  { id: 'cat-5', name: 'Python Programming', icon: 'Code2', count: 35, description: 'Core Python, OOP, scripting, automation, and best practices' },
  { id: 'cat-6', name: 'Java Programming', icon: 'FileCode', count: 28, description: 'Core Java, Collections, Multithreading, and Spring Boot' },
  { id: 'cat-7', name: 'C Programming', icon: 'Terminal', count: 19, description: 'Pointers, memory management, data structures in C' },
  { id: 'cat-8', name: 'HTML & CSS', icon: 'Layout', count: 26, description: 'Modern responsive web design, Flexbox, Grid, Tailwind' },
  { id: 'cat-9', name: 'Database Management System', icon: 'Database', count: 22, description: 'SQL, normalization, indexing, transactions, and NoSQL' },
  { id: 'cat-10', name: 'Operating System', icon: 'HardDrive', count: 17, description: 'Processes, threads, scheduling, memory, and file systems' },
  { id: 'cat-11', name: 'Computer Networks', icon: 'Network', count: 19, description: 'OSI model, TCP/IP, routing protocols, sockets, and security' },
  { id: 'cat-12', name: 'Mathematics', icon: 'Sigma', count: 20, description: 'Linear algebra, calculus, probability & discrete math for CS' },
  { id: 'cat-13', name: 'Cyber Security', icon: 'ShieldCheck', count: 15, description: 'Ethical hacking, cryptography, network defense, and OWASP' },
  { id: 'cat-14', name: 'Engineering Books', icon: 'BookOpen', count: 32, description: 'Standard university textbooks for B.Tech & Diploma' },
  { id: 'cat-15', name: 'College Notes', icon: 'GraduationCap', count: 45, description: 'Topper handwritten notes, unit-wise summaries, and lab guides' },
  { id: 'cat-16', name: 'Competitive Exam Notes', icon: 'Trophy', count: 30, description: 'GATE CS, UGC NET, ISRO, Placement Coding & Aptitude' }
];

export const INITIAL_BOOKS_AND_NOTES = [
  {
    id: 'book-ai-01',
    title: 'Modern Artificial Intelligence: Theory & Practice',
    author: 'Dr. Stuart Russell & Peter Norvig (Annotated)',
    category: 'Artificial Intelligence',
    type: 'book',
    price: 149,
    isFree: false,
    rating: 4.9,
    reviewsCount: 312,
    pages: 480,
    language: 'English',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    description: 'Comprehensive guide covering search algorithms, knowledge representation, reinforcement learning, and LLM foundations with practical code snippets.',
    tableOfContents: [
      'Chapter 1: Intelligent Agents and Search Strategies',
      'Chapter 2: Adversarial Search and Games',
      'Chapter 3: Probabilistic Reasoning & Bayes Nets',
      'Chapter 4: Reinforcement Learning & MDPs',
      'Chapter 5: Natural Language & Large Language Models'
    ],
    samplePdfUrl: '/samples/ai-sample.pdf',
    downloadsCount: 1420,
    readsCount: 5890
  },
  {
    id: 'note-ai-02',
    title: 'AI Quick Revision & Formula Sheet',
    author: 'AI Reads Editorial Team',
    category: 'Artificial Intelligence',
    type: 'notes',
    price: 0,
    isFree: true,
    rating: 4.8,
    reviewsCount: 420,
    pages: 42,
    language: 'English',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    description: 'Concise, high-yield revision notes containing heuristic formulas, A* search proofs, Alpha-Beta pruning rules, and neural network backpropagation cheat sheets.',
    tableOfContents: ['Module 1: Search Formulations', 'Module 2: Logic & Inference Rules', 'Module 3: Neural Net Calculus'],
    samplePdfUrl: '/samples/ai-revision.pdf',
    downloadsCount: 4890,
    readsCount: 12400
  },
  {
    id: 'book-ml-01',
    title: 'Hands-On Machine Learning with Scikit-Learn',
    author: 'Aurélien Géron',
    category: 'Machine Learning',
    type: 'book',
    price: 199,
    isFree: false,
    rating: 4.9,
    reviewsCount: 580,
    pages: 560,
    language: 'English',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80',
    description: 'The definitive handbook to master end-to-end Machine Learning pipelines from raw data cleansing to model deployment and hyperparameter tuning.',
    tableOfContents: [
      '1. The Machine Learning Landscape',
      '2. End-to-End ML Project Walkthrough',
      '3. Classification & ROC/AUC Metrics',
      '4. Training Linear & Logistic Models',
      '5. Support Vector Machines & Kernels',
      '6. Decision Trees & Random Forests',
      '7. Ensemble Learning & Boosting'
    ],
    samplePdfUrl: '/samples/ml-sample.pdf',
    downloadsCount: 2900,
    readsCount: 9400
  },
  {
    id: 'note-ml-02',
    title: 'Machine Learning Complete Hand-Written Notes',
    author: 'Er. Rohan Mehta (AIR 42)',
    category: 'Machine Learning',
    type: 'notes',
    price: 49,
    isFree: false,
    rating: 4.7,
    reviewsCount: 195,
    pages: 96,
    language: 'Bilingual',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    description: 'Neatly organized handwritten notes with intuitive diagrams and bilingual (English + Hindi) explanations for Bias-Variance tradeoff, Gradient Descent variants, and Overfitting remedies.',
    tableOfContents: ['Unit 1: Supervised Learning Core', 'Unit 2: Unsupervised Clustering', 'Unit 3: Regularization (L1/L2)'],
    samplePdfUrl: '/samples/ml-notes.pdf',
    downloadsCount: 1840,
    readsCount: 4300
  },
  {
    id: 'book-dl-01',
    title: 'Deep Learning with PyTorch: From Zero to Hero',
    author: 'Dr. Ian Goodfellow & Yoshua Bengio',
    category: 'Deep Learning',
    type: 'book',
    price: 199,
    isFree: false,
    rating: 4.9,
    reviewsCount: 412,
    pages: 620,
    language: 'English',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    description: 'Master Deep Neural Networks, ConvNets for Computer Vision, LSTMs, Attention Mechanisms, and Transformer architectures using PyTorch.',
    tableOfContents: [
      'Chapter 1: Tensors and Automatic Differentiation',
      'Chapter 2: Multilayer Perceptrons and Activation Functions',
      'Chapter 3: Convolutional Neural Networks',
      'Chapter 4: Sequence Models and Attention',
      'Chapter 5: Vision Transformers (ViT)'
    ],
    samplePdfUrl: '/samples/dl-sample.pdf',
    downloadsCount: 1750,
    readsCount: 6100
  },
  {
    id: 'note-dl-02',
    title: 'Deep Learning Exam Cram Sheet & Key Equations',
    author: 'Prof. Ananya Sen',
    category: 'Deep Learning',
    type: 'notes',
    price: 0,
    isFree: true,
    rating: 4.8,
    reviewsCount: 310,
    pages: 38,
    language: 'English',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    description: 'Free revision sheet with vanishing gradient mathematical proofs, batch normalization derivations, dropout heuristics, and loss functions comparison.',
    tableOfContents: ['Section 1: Optimization Algorithms', 'Section 2: CNN Layer Calculations', 'Section 3: Attention Matrices'],
    samplePdfUrl: '/samples/dl-notes.pdf',
    downloadsCount: 3820,
    readsCount: 8900
  },
  {
    id: 'book-ds-01',
    title: 'Data Science & Statistical Inference Handbook',
    author: 'Jake VanderPlas',
    category: 'Data Science',
    type: 'book',
    price: 99,
    isFree: false,
    rating: 4.8,
    reviewsCount: 280,
    pages: 410,
    language: 'English',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    description: 'Essential toolkit for modern data scientists covering IPython, NumPy vectorization, Pandas data frames, Matplotlib, and statistical hypothesis testing.',
    tableOfContents: [
      'Unit 1: Fast Computation with NumPy',
      'Unit 2: Data Manipulation with Pandas',
      'Unit 3: Data Visualization with Seaborn',
      'Unit 4: Hypothesis Testing & p-values'
    ],
    samplePdfUrl: '/samples/ds-sample.pdf',
    downloadsCount: 2100,
    readsCount: 7200
  },
  {
    id: 'note-ds-02',
    title: 'Data Science Interview Cheatsheet (Top 100 Q&A)',
    author: 'Tech Placement Cell',
    category: 'Data Science',
    type: 'notes',
    price: 49,
    isFree: false,
    rating: 4.9,
    reviewsCount: 520,
    pages: 75,
    language: 'English',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    description: 'Handcrafted interview questions asked at top MNCs including FAANG: SQL interview problems, A/B testing metrics, feature engineering techniques, and case studies.',
    tableOfContents: ['1. Probability & Stats Q&A', '2. SQL Complex Window Queries', '3. Model Evaluation Scenarios'],
    samplePdfUrl: '/samples/ds-interview.pdf',
    downloadsCount: 3600,
    readsCount: 9900
  },
  {
    id: 'book-py-01',
    title: 'Python Mastery: From Fundamentals to Architecture',
    author: 'David Beazley',
    category: 'Python Programming',
    type: 'book',
    price: 149,
    isFree: false,
    rating: 4.9,
    reviewsCount: 640,
    pages: 520,
    language: 'English',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80',
    description: 'Dive deep into Python internals: dunder methods, generator expressions, decorators, context managers, concurrency (asyncio), and meta-programming.',
    tableOfContents: [
      '1. Data Structures and Sequence Protocols',
      '2. Functions as First-Class Objects',
      '3. Object-Oriented Idioms & Inheritance',
      '4. Control Flow, Iterators & Generators',
      '5. Concurrency & Asyncio Pipelines'
    ],
    samplePdfUrl: '/samples/py-sample.pdf',
    downloadsCount: 4200,
    readsCount: 14200
  },
  {
    id: 'note-py-02',
    title: 'Python in 30 Days – Complete Student Notes',
    author: 'CodeWithAman',
    category: 'Python Programming',
    type: 'notes',
    price: 0,
    isFree: true,
    rating: 4.9,
    reviewsCount: 890,
    pages: 88,
    language: 'Bilingual',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
    description: 'Bilingual student favorite guide with day-by-day practical exercises, syntax cheat sheets, solved coding assignments, and mini-projects.',
    tableOfContents: ['Day 1-10: Basics & Loops', 'Day 11-20: Functions & OOP', 'Day 21-30: File Handling & Modules'],
    samplePdfUrl: '/samples/py-notes.pdf',
    downloadsCount: 9200,
    readsCount: 28000
  },
  {
    id: 'book-java-01',
    title: 'Core Java for Professionals: Complete Reference',
    author: 'Herbert Schildt',
    category: 'Java Programming',
    type: 'book',
    price: 149,
    isFree: false,
    rating: 4.8,
    reviewsCount: 480,
    pages: 720,
    language: 'English',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    description: 'Comprehensive guide to Java SE 21 including lambda expressions, virtual threads, streams, collections, multi-threading, and JVM garbage collection architecture.',
    tableOfContents: [
      'Part 1: The Java Language Fundamentals',
      'Part 2: The Java Library & Collections API',
      'Part 3: Concurrency & Virtual Threads',
      'Part 4: JVM Internals & Memory Model'
    ],
    samplePdfUrl: '/samples/java-sample.pdf',
    downloadsCount: 3100,
    readsCount: 8900
  },
  {
    id: 'note-java-02',
    title: 'Java OOPs & DSA Interview Capsule',
    author: 'Campus Placement Topper',
    category: 'Java Programming',
    type: 'notes',
    price: 49,
    isFree: false,
    rating: 4.7,
    reviewsCount: 230,
    pages: 64,
    language: 'English',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?auto=format&fit=crop&w=800&q=80',
    description: 'Summary of 4 Pillars of OOPs with Java code, SOLID principles, HashMap internal implementation, and Top 50 Java coding challenges.',
    tableOfContents: ['Section 1: Encapsulation & Polymorphism', 'Section 2: Collections Deep Dive', 'Section 3: Top Interview Questions'],
    samplePdfUrl: '/samples/java-notes.pdf',
    downloadsCount: 1650,
    readsCount: 5100
  },
  {
    id: 'book-c-01',
    title: 'The C Programming Language (Mastering Pointers)',
    author: 'Brian W. Kernighan & Dennis M. Ritchie',
    category: 'C Programming',
    type: 'book',
    price: 99,
    isFree: false,
    rating: 4.9,
    reviewsCount: 720,
    pages: 320,
    language: 'English',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    description: 'The golden classic programming textbook covering low-level control, pointers, pointer arithmetic, memory allocation, structs, and bitwise manipulation.',
    tableOfContents: [
      '1. Types, Operators and Expressions',
      '2. Control Flow',
      '3. Functions and Program Structure',
      '4. Pointers and Arrays',
      '5. Structures and Unions',
      '6. File I/O and System Calls'
    ],
    samplePdfUrl: '/samples/c-sample.pdf',
    downloadsCount: 5200,
    readsCount: 16800
  },
  {
    id: 'note-c-02',
    title: 'C Programming Handwritten College Notes',
    author: 'NIT Surathkal CS Dept',
    category: 'C Programming',
    type: 'notes',
    price: 0,
    isFree: true,
    rating: 4.8,
    reviewsCount: 410,
    pages: 58,
    language: 'English',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    description: 'Clear visual notes detailing pointer diagrams, memory layout (Stack, Heap, Data, Text segment), dynamic memory allocation bugs, and lab assignments.',
    tableOfContents: ['Unit 1: Syntax & Operators', 'Unit 2: Pointer Arithmetic Diagrams', 'Unit 3: File Operations'],
    samplePdfUrl: '/samples/c-notes.pdf',
    downloadsCount: 4100,
    readsCount: 11200
  },
  {
    id: 'book-web-01',
    title: 'Modern Web Development with HTML5, CSS3 & Tailwind',
    author: 'Angela Yu & Brad Traversy',
    category: 'HTML & CSS',
    type: 'book',
    price: 99,
    isFree: false,
    rating: 4.9,
    reviewsCount: 530,
    pages: 390,
    language: 'English',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    description: 'Build modern responsive websites from scratch with semantic HTML5 tags, CSS Flexbox, CSS Grid layouts, Tailwind utility classes, and accessibility (a11y).',
    tableOfContents: [
      '1. Semantic HTML Structure',
      '2. CSS Box Model & Selectors',
      '3. Flexbox & Grid Masterclass',
      '4. Tailwind CSS Utility-First Design',
      '5. Responsive Mobile-First Breakpoints'
    ],
    samplePdfUrl: '/samples/web-sample.pdf',
    downloadsCount: 3800,
    readsCount: 12100
  },
  {
    id: 'note-web-02',
    title: 'Frontend Cheat Sheet & CSS Tricks',
    author: 'Web Dev Academy',
    category: 'HTML & CSS',
    type: 'notes',
    price: 0,
    isFree: true,
    rating: 4.7,
    reviewsCount: 320,
    pages: 35,
    language: 'English',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    description: 'Quick reference guide with Flexbox cheatsheet visual cards, CSS Grid layout patterns, keyframe animations, and cross-browser fixes.',
    tableOfContents: ['Sheet 1: Flexbox Quick Reference', 'Sheet 2: Grid Layouts', 'Sheet 3: Responsive Media Queries'],
    samplePdfUrl: '/samples/web-notes.pdf',
    downloadsCount: 5600,
    readsCount: 14500
  },
  {
    id: 'book-dbms-01',
    title: 'Database System Concepts (The Silver Book)',
    author: 'Silberschatz, Korth & Sudarshan',
    category: 'Database Management System',
    type: 'book',
    price: 149,
    isFree: false,
    rating: 4.8,
    reviewsCount: 460,
    pages: 680,
    language: 'English',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
    description: 'Comprehensive college standard textbook explaining relational algebra, SQL optimization, normalization (1NF to BCNF), indexing (B+ Trees), and ACID transactions.',
    tableOfContents: [
      '1. Relational Model & Formal Queries',
      '2. Advanced SQL & Triggers',
      '3. Normalization (1NF, 2NF, 3NF, BCNF)',
      '4. Indexing & Hashing (B+ Trees)',
      '5. Transactions, Concurrency & Recovery'
    ],
    samplePdfUrl: '/samples/dbms-sample.pdf',
    downloadsCount: 2980,
    readsCount: 8800
  },
  {
    id: 'note-dbms-02',
    title: 'DBMS Topper Notes for University & GATE',
    author: 'Prof. R.K. Sharma',
    category: 'Database Management System',
    type: 'notes',
    price: 49,
    isFree: false,
    rating: 4.9,
    reviewsCount: 380,
    pages: 82,
    language: 'Bilingual',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    description: 'Short revision notes on functional dependencies, candidate key algorithms, serializability testing, 2PL protocol, and solved university previous year questions.',
    tableOfContents: ['Module 1: ER Diagrams to Tables', 'Module 2: Normalization Step-by-Step', 'Module 3: Concurrency Control'],
    samplePdfUrl: '/samples/dbms-notes.pdf',
    downloadsCount: 3400,
    readsCount: 9600
  },
  {
    id: 'book-os-01',
    title: 'Operating System Concepts (The Dinosaur Book)',
    author: 'Abraham Silberschatz & Peter Galvin',
    category: 'Operating System',
    type: 'book',
    price: 149,
    isFree: false,
    rating: 4.9,
    reviewsCount: 510,
    pages: 710,
    language: 'English',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80',
    description: 'Foundational textbook on operating system design: process synchronization, semaphores, deadlock handling algorithms, virtual memory paging, and Linux architecture.',
    tableOfContents: [
      '1. Operating System Architectures',
      '2. Process Management & Scheduling',
      '3. Synchronization & Semaphores',
      '4. Deadlocks & Banker Algorithm',
      '5. Main Memory & Paging Algorithms',
      '6. Virtual Memory & Page Replacement'
    ],
    samplePdfUrl: '/samples/os-sample.pdf',
    downloadsCount: 4100,
    readsCount: 13400
  },
  {
    id: 'note-os-02',
    title: 'Operating Systems Quick Formula & Concept Deck',
    author: 'Gate Smashers Team',
    category: 'Operating System',
    type: 'notes',
    price: 0,
    isFree: true,
    rating: 4.9,
    reviewsCount: 650,
    pages: 50,
    language: 'English',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    description: 'Essential revision notes with turnaround time formulas, Gantt charts, Banker algorithm safety state checks, and TLB hit ratio numericals.',
    tableOfContents: ['1. CPU Scheduling Solved Numerical', '2. Deadlock Avoidance Formulas', '3. Page Replacement (FIFO, LRU, Optimal)'],
    samplePdfUrl: '/samples/os-notes.pdf',
    downloadsCount: 7800,
    readsCount: 21500
  },
  {
    id: 'book-cn-01',
    title: 'Computer Networking: A Top-Down Approach',
    author: 'James F. Kurose & Keith W. Ross',
    category: 'Computer Networks',
    type: 'book',
    price: 149,
    isFree: false,
    rating: 4.9,
    reviewsCount: 470,
    pages: 640,
    language: 'English',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    description: 'Leading textbook teaching networking through layers: Application (HTTP/DNS), Transport (TCP/UDP), Network (IP/BGP), and Link layer (Ethernet/WiFi).',
    tableOfContents: [
      '1. Computer Networks and the Internet',
      '2. Application Layer (HTTP, DNS, Email)',
      '3. Transport Layer (TCP Flow & Congestion Control)',
      '4. Network Layer: Data & Control Planes',
      '5. Link Layer and LANs'
    ],
    samplePdfUrl: '/samples/cn-sample.pdf',
    downloadsCount: 3100,
    readsCount: 9800
  },
  {
    id: 'note-cn-02',
    title: 'Computer Networks Subnetting & Protocol Notes',
    author: 'Network Engineers Guild',
    category: 'Computer Networks',
    type: 'notes',
    price: 49,
    isFree: false,
    rating: 4.8,
    reviewsCount: 220,
    pages: 62,
    language: 'English',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    description: 'Step-by-step IP addressing & CIDR subnetting formulas, TCP 3-way handshake diagrams, sliding window protocol calculations, and OSI vs TCP/IP summary.',
    tableOfContents: ['Unit 1: Subnetting Made Easy', 'Unit 2: TCP vs UDP Deep Dive', 'Unit 3: Routing Algorithms (Dijkstra/Bellman-Ford)'],
    samplePdfUrl: '/samples/cn-notes.pdf',
    downloadsCount: 1950,
    readsCount: 6100
  },
  {
    id: 'book-math-01',
    title: 'Discrete Mathematics and Its Applications',
    author: 'Kenneth H. Rosen',
    category: 'Mathematics',
    type: 'book',
    price: 99,
    isFree: false,
    rating: 4.8,
    reviewsCount: 390,
    pages: 580,
    language: 'English',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    description: 'The standard reference for propositional logic, sets, relations, combinatorics, recurrence relations, graph theory, and Boolean algebra.',
    tableOfContents: [
      '1. The Foundations: Logic and Proofs',
      '2. Sets, Functions, Sequences & Matrices',
      '3. Counting & Pigeonhole Principle',
      '4. Advanced Counting & Recurrence',
      '5. Graphs and Trees'
    ],
    samplePdfUrl: '/samples/math-sample.pdf',
    downloadsCount: 2400,
    readsCount: 7500
  },
  {
    id: 'note-math-02',
    title: 'Engineering Mathematics Formula & Theorem Handbook',
    author: 'Dr. H.K. Dass & AI Reads Math Faculty',
    category: 'Mathematics',
    type: 'notes',
    price: 0,
    isFree: true,
    rating: 4.9,
    reviewsCount: 510,
    pages: 72,
    language: 'English',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    description: 'Comprehensive formula book for engineering exams: Eigenvalues & Cayley-Hamilton, Laplace transforms, Fourier series, Vector calculus, and Probability distributions.',
    tableOfContents: ['1. Linear Algebra Formulas', '2. Calculus & Differential Equations', '3. Probability Distributions Cheat Sheet'],
    samplePdfUrl: '/samples/math-notes.pdf',
    downloadsCount: 6800,
    readsCount: 19400
  },
  {
    id: 'book-sec-01',
    title: 'The Web Application Hacker Handbook',
    author: 'Dafydd Stuttard & Marcus Pinto',
    category: 'Cyber Security',
    type: 'book',
    price: 199,
    isFree: false,
    rating: 4.9,
    reviewsCount: 440,
    pages: 540,
    language: 'English',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    description: 'Definitive guide to finding and exploiting security flaws in web applications: SQL Injection, XSS, CSRF, authentication bypass, and securing cloud APIs.',
    tableOfContents: [
      '1. Web Application Security Architecture',
      '2. Bypassing Client-Side Controls',
      '3. Attacking Authentication & Session Management',
      '4. SQL Injection & Database Exploitation',
      '5. Cross-Site Scripting (XSS) in Practice'
    ],
    samplePdfUrl: '/samples/sec-sample.pdf',
    downloadsCount: 2200,
    readsCount: 8100
  },
  {
    id: 'note-eng-01',
    title: 'B.Tech 1st Year Complete Engineering Bundle',
    author: 'All-India Toppers Circle',
    category: 'Engineering Books',
    type: 'notes',
    price: 99,
    isFree: false,
    rating: 4.8,
    reviewsCount: 620,
    pages: 180,
    language: 'English',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    description: 'All-in-one semester 1 & 2 guide containing Engineering Physics, Basic Electrical Engineering, Engineering Chemistry, and Engineering Graphics notes.',
    tableOfContents: ['Physics Modules', 'Basic Electrical AC/DC', 'Chemistry Organic/Polymer', 'Engineering Graphics Projection'],
    samplePdfUrl: '/samples/eng-bundle.pdf',
    downloadsCount: 4100,
    readsCount: 13200
  },
  {
    id: 'note-college-01',
    title: 'Data Structures & Algorithms Handwritten Topper Notes',
    author: 'Shubham Bansal (IIT Bombay)',
    category: 'College Notes',
    type: 'notes',
    price: 49,
    isFree: false,
    rating: 5.0,
    reviewsCount: 780,
    pages: 110,
    language: 'Bilingual',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?auto=format&fit=crop&w=800&q=80',
    description: 'Handcrafted notes with time-complexity proofs, visual tree diagrams, dynamic programming tabulation vs memoization, and 150 LeetCode patterns.',
    tableOfContents: [
      '1. Arrays & Two-Pointers',
      '2. Linked Lists & Fast-Slow Pointers',
      '3. Stacks, Queues & Monotonic Stacks',
      '4. Trees, Traversals & BST',
      '5. Dynamic Programming State Transitions'
    ],
    samplePdfUrl: '/samples/dsa-notes.pdf',
    downloadsCount: 8400,
    readsCount: 24500
  },
  {
    id: 'note-exam-01',
    title: 'GATE CS & IT 15-Year Solved Papers with Short Tricks',
    author: 'GATE CS Rankers Collective',
    category: 'Competitive Exam Notes',
    type: 'notes',
    price: 199,
    isFree: false,
    rating: 4.9,
    reviewsCount: 890,
    pages: 350,
    language: 'English',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    description: 'Chapter-wise compilation of previous 15 years GATE CS questions with detailed step-by-step solutions, elimination tricks, and shortcut formulas.',
    tableOfContents: [
      '1. Theory of Computation & Compiler Design',
      '2. Computer Organization & Architecture',
      '3. Operating Systems & DBMS',
      '4. Algorithms & Data Structures',
      '5. Discrete Mathematics & Aptitude'
    ],
    samplePdfUrl: '/samples/gate-solved.pdf',
    downloadsCount: 5100,
    readsCount: 16700
  },
  {
    id: 'note-exam-02',
    title: 'Campus Placement Aptitude & Verbal Reasoning Booster',
    author: 'Placement Cracker Squad',
    category: 'Competitive Exam Notes',
    type: 'notes',
    price: 0,
    isFree: true,
    rating: 4.8,
    reviewsCount: 940,
    pages: 85,
    language: 'English',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    description: 'Targeted practice for TCS, Infosys, Wipro, Cognizant, and product companies: Speed math tricks, quantitative aptitude formulas, and logical reasoning shortcuts.',
    tableOfContents: ['1. Time & Work Shortcut Formulas', '2. Permutations & Probability', '3. Syllogisms & Seating Arrangements'],
    samplePdfUrl: '/samples/aptitude-booster.pdf',
    downloadsCount: 11200,
    readsCount: 31000
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'ord_demo_101',
    userId: 'user-student-1',
    userName: 'Alex Sharma',
    userEmail: 'student@aireads.com',
    bookId: 'book-ai-01',
    bookTitle: 'Modern Artificial Intelligence: Theory & Practice',
    bookAuthor: 'Dr. Stuart Russell & Peter Norvig (Annotated)',
    amount: 149,
    currency: 'INR',
    razorpayOrderId: 'order_NYk1Z2P9demo',
    razorpayPaymentId: 'pay_NYk1Z2P9demo001',
    status: 'paid',
    createdAt: '2026-10-24T10:15:00.000Z'
  },
  {
    id: 'ord_demo_102',
    userId: 'user-student-1',
    userName: 'Alex Sharma',
    userEmail: 'student@aireads.com',
    bookId: 'note-college-01',
    bookTitle: 'Data Structures & Algorithms Handwritten Topper Notes',
    bookAuthor: 'Shubham Bansal (IIT Bombay)',
    amount: 49,
    currency: 'INR',
    razorpayOrderId: 'order_KJ88L0Pdemo',
    razorpayPaymentId: 'pay_KJ88L0Pdemo002',
    status: 'paid',
    createdAt: '2026-10-27T16:30:00.000Z'
  }
];

export const INITIAL_LIBRARY = [
  {
    userId: 'user-student-1',
    bookId: 'book-ai-01',
    progress: 42,
    lastReadPage: 14,
    lastReadAt: '2026-10-31T14:20:00.000Z',
    isPurchased: true,
    isSaved: true
  },
  {
    userId: 'user-student-1',
    bookId: 'note-college-01',
    progress: 78,
    lastReadPage: 45,
    lastReadAt: '2026-11-01T09:10:00.000Z',
    isPurchased: true,
    isSaved: true
  },
  {
    userId: 'user-student-1',
    bookId: 'note-py-02',
    progress: 60,
    lastReadPage: 32,
    lastReadAt: '2026-10-29T18:00:00.000Z',
    isPurchased: false,
    isSaved: true
  }
];

export const INITIAL_AI_HISTORY = [
  {
    id: 'ai-hist-1',
    userId: 'user-student-1',
    type: 'summary',
    title: 'Summary of A* Search & Heuristic Admissibility',
    topic: 'Artificial Intelligence Search Strategies',
    resultPreview: 'A* is an informed search algorithm combining path cost g(n) and estimated cost to goal h(n)...',
    createdAt: '2026-10-31T11:00:00.000Z'
  },
  {
    id: 'ai-hist-2',
    userId: 'user-student-1',
    type: 'mcq',
    title: '10 MCQs on Dynamic Programming & Memoization',
    topic: 'Data Structures and Algorithms',
    resultPreview: 'Score: 9/10. Tested overlapping subproblems, optimal substructure, and space optimization...',
    createdAt: '2026-10-30T17:45:00.000Z'
  },
  {
    id: 'ai-hist-3',
    userId: 'user-student-1',
    type: 'bilingual_explain',
    title: 'Explained: Bias-Variance Tradeoff in Simple Hindi & English',
    topic: 'Machine Learning Fundamentals',
    resultPreview: 'High Bias मतलब Underfitting (Model बहुत simple है), High Variance मतलब Overfitting...',
    createdAt: '2026-10-28T14:10:00.000Z'
  }
];

export const INITIAL_USERS = [
  {
    id: 'user-student-1',
    name: 'Alex Sharma',
    email: 'student@aireads.com',
    passwordHash: '$2a$10$wN0oG/yLdE8Z8Mh0t0W8.u2u7ePZl6m8YxXyWlR8o3JgU3bW9/Tae', // 'password123'
    role: 'student',
    college: 'Delhi Technological University',
    semester: '6th Semester',
    joinedAt: '2026-09-15T00:00:00.000Z'
  },
  {
    id: 'user-admin-1',
    name: 'Alok Kumar',
    email: 'admin@aireads.com',
    passwordHash: '$2a$10$tZ387mD8z4qW0pA8jK9g4.uH2/yG3yA6bV1yL5n7t8r6w9q4e2r1y', // 'admin123'
    role: 'admin',
    joinedAt: '2026-08-01T00:00:00.000Z'
  }
];

class Database {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read existing store.json, creating initial store.', err.message);
    }

    const initial = {
      categories: INITIAL_CATEGORIES,
      books: INITIAL_BOOKS_AND_NOTES,
      orders: INITIAL_ORDERS,
      library: INITIAL_LIBRARY,
      aiHistory: INITIAL_AI_HISTORY,
      users: INITIAL_USERS
    };
    this.saveData(initial);
    return initial;
  }

  saveData(data = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write store.json:', err);
    }
  }

  // Categories
  getCategories() {
    return this.data.categories;
  }
  addCategory(category) {
    this.data.categories.push(category);
    this.saveData();
    return category;
  }
  updateCategory(id, updates) {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
      this.saveData();
      return this.data.categories[idx];
    }
    return null;
  }
  deleteCategory(id) {
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.saveData();
    return true;
  }

  // Books
  getBooks() {
    return this.data.books;
  }
  getBookById(id) {
    return this.data.books.find(b => b.id === id);
  }
  addBook(book) {
    this.data.books.unshift(book);
    this.saveData();
    return book;
  }
  updateBook(id, updates) {
    const idx = this.data.books.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.data.books[idx] = { ...this.data.books[idx], ...updates };
      this.saveData();
      return this.data.books[idx];
    }
    return null;
  }
  deleteBook(id) {
    this.data.books = this.data.books.filter(b => b.id !== id);
    this.saveData();
    return true;
  }

  // Orders
  getOrders() {
    return this.data.orders;
  }
  getUserOrders(userId) {
    return this.data.orders.filter(o => o.userId === userId);
  }
  addOrder(order) {
    this.data.orders.unshift(order);
    this.saveData();
    return order;
  }

  // User Library
  getUserLibrary(userId) {
    return this.data.library.filter(l => l.userId === userId);
  }
  addToLibrary(record) {
    const existing = this.data.library.find(l => l.userId === record.userId && l.bookId === record.bookId);
    if (existing) {
      Object.assign(existing, record);
    } else {
      this.data.library.unshift(record);
    }
    this.saveData();
  }
  updateLibraryProgress(userId, bookId, progress, lastReadPage) {
    let item = this.data.library.find(l => l.userId === userId && l.bookId === bookId);
    if (!item) {
      item = { userId, bookId, progress, lastReadPage, lastReadAt: new Date().toISOString(), isSaved: true, isPurchased: false };
      this.data.library.unshift(item);
    } else {
      item.progress = progress;
      item.lastReadPage = lastReadPage;
      item.lastReadAt = new Date().toISOString();
    }
    this.saveData();
    return item;
  }

  // AI History
  getUserAIHistory(userId) {
    return this.data.aiHistory.filter(h => h.userId === userId);
  }
  addAIHistory(entry) {
    this.data.aiHistory.unshift(entry);
    this.saveData();
    return entry;
  }

  // Users
  getUsers() {
    return this.data.users;
  }
  findUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }
  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }
  addUser(user) {
    this.data.users.push(user);
    this.saveData();
    return user;
  }
}

export const db = new Database();
