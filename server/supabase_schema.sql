-- =========================================================================
-- AI Reads: Supabase PostgreSQL Schema & Storage Migration Script
-- Platform: "Read Smarter. Learn Faster. Grow Better."
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    college TEXT,
    semester TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT DEFAULT 'BookOpen',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BOOKS & STUDY MATERIALS
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'book' CHECK (type IN ('book', 'notes')),
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_free BOOLEAN NOT NULL DEFAULT true,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    pages INT DEFAULT 100,
    language TEXT DEFAULT 'English',
    cover_image TEXT NOT NULL,
    description TEXT NOT NULL,
    table_of_contents JSONB DEFAULT '[]'::jsonb,
    pdf_url TEXT,
    sample_pdf_url TEXT,
    featured BOOLEAN DEFAULT false,
    downloads_count INT DEFAULT 0,
    reads_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ORDERS & PAYMENTS (Razorpay verified transactions)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
    book_title TEXT NOT NULL,
    book_author TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    razorpay_order_id TEXT NOT NULL,
    razorpay_payment_id TEXT NOT NULL,
    razorpay_signature TEXT,
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. USER LIBRARY & PROGRESS TRACKER
CREATE TABLE IF NOT EXISTS public.user_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
    progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    last_read_page INT NOT NULL DEFAULT 1,
    is_purchased BOOLEAN NOT NULL DEFAULT false,
    is_saved BOOLEAN NOT NULL DEFAULT true,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, book_id)
);

-- 6. AI STUDY SESSIONS & INTERACTIONS
CREATE TABLE IF NOT EXISTS public.ai_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('qa', 'summary', 'notes', 'mcq', 'bilingual_explain', 'exam_prep', 'flashcard', 'text_to_notes')),
    title TEXT NOT NULL,
    topic TEXT,
    book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
    prompt_snippet TEXT,
    response_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_history ENABLE ROW LEVEL SECURITY;

-- Read policies (Public readable catalog)
CREATE POLICY "Public categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public books are viewable by everyone" ON public.books FOR SELECT USING (true);

-- User-scoped policies
CREATE POLICY "Users can view and update their own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own library" ON public.user_library
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own AI history" ON public.ai_history
    FOR ALL USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins have full access to books" ON public.books
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- SUPABASE STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES ('books-pdf', 'books-pdf', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;
