-- ==============================================================================
-- Ever, Together ♡ - Supabase PostgreSQL Schema & Migrations
-- Version 1.0 (October 2026)
-- Complete schema with Row Level Security (RLS), constraints, and seed data.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Couples Table (The private shared universe for two partners)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.couples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'Ever, Together',
    anniversary_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. Couple Members Table (Enforces max 2 authorized members per couple)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.couple_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'partner' CHECK (role IN ('partner', 'creator')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(couple_id, user_id)
);

-- Function and trigger to ensure a couple cannot have more than 2 members
CREATE OR REPLACE FUNCTION public.check_couple_member_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM public.couple_members WHERE couple_id = NEW.couple_id) >= 2 THEN
        RAISE EXCEPTION 'A couple space can only have at most two authorized members.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_couple_member_limit ON public.couple_members;
CREATE TRIGGER trg_couple_member_limit
    BEFORE INSERT ON public.couple_members
    FOR EACH ROW
    EXECUTE FUNCTION public.check_couple_member_limit();

-- ------------------------------------------------------------------------------
-- 3. Categories Table (Preseeded 5 categories for monthly chapters)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL DEFAULT 'Sparkles',
    display_order INT NOT NULL DEFAULT 0
);

-- Seed predefined 5 categories
INSERT INTO public.categories (name, slug, icon, display_order)
VALUES
    ('Best Movie', 'movie', 'Film', 1),
    ('Best Game', 'game', 'Gamepad2', 2),
    ('Best Food', 'food', 'Utensils', 3),
    ('Best Memory', 'memory', 'Camera', 4),
    ('Best Music', 'music', 'Music', 5)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;

-- ------------------------------------------------------------------------------
-- 4. Monthly Chapters Table (One chapter per couple per calendar month)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.monthly_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year >= 2020),
    title TEXT NOT NULL,
    subtitle TEXT,
    cover_image_path TEXT,
    reflection TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'revealed', 'finalized')),
    is_revealed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(couple_id, year, month)
);

-- Index for chronological timeline queries
CREATE INDEX IF NOT EXISTS idx_monthly_chapters_timeline 
ON public.monthly_chapters(couple_id, year DESC, month DESC);

-- ------------------------------------------------------------------------------
-- 5. Entries Table (Items ranked under each category for a chapter)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID NOT NULL REFERENCES public.monthly_chapters(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT,
    matter_note TEXT, -- "Why did this matter to us?"
    image_path TEXT,
    external_url TEXT,
    winner_status TEXT DEFAULT 'none' CHECK (winner_status IN ('winner', 'runner_up', 'honorable_mention', 'none')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_entries_chapter ON public.entries(chapter_id, category_id);

-- ------------------------------------------------------------------------------
-- 6. Rankings Table (Individual rating and tier from each partner)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES public.entries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating NUMERIC(3,1) CHECK (rating BETWEEN 1.0 AND 10.0),
    tier TEXT CHECK (tier IN ('S', 'A', 'B', 'C', 'Honorable Mention')),
    rank_position INT,
    comment TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(entry_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_rankings_entry ON public.rankings(entry_id);

-- ------------------------------------------------------------------------------
-- 7. Keepsakes Table (Love letters, reflections, milestones & time capsules)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.keepsakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.monthly_chapters(id) ON DELETE SET NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'reflection' CHECK (type IN ('reflection', 'letter', 'time_capsule', 'milestone')),
    content TEXT NOT NULL,
    unlock_at TIMESTAMPTZ, -- for time capsules
    is_private_draft BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_keepsakes_couple ON public.keepsakes(couple_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keepsakes ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is member of couple
CREATE OR REPLACE FUNCTION public.is_member_of_couple(couple_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.couple_members
        WHERE couple_members.couple_id = is_member_of_couple.couple_id
          AND couple_members.user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Categories: visible to all authenticated users
CREATE POLICY "Categories are readable by authenticated users"
ON public.categories FOR SELECT
TO authenticated
USING (true);

-- Couples policies
CREATE POLICY "Users can view their own couple space"
ON public.couples FOR SELECT
TO authenticated
USING (public.is_member_of_couple(id));

CREATE POLICY "Users can update their own couple space"
ON public.couples FOR UPDATE
TO authenticated
USING (public.is_member_of_couple(id));

-- Couple Members policies
CREATE POLICY "Members can view members of their couple"
ON public.couple_members FOR SELECT
TO authenticated
USING (public.is_member_of_couple(couple_id));

CREATE POLICY "Members can update their own member profile"
ON public.couple_members FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Monthly Chapters policies
CREATE POLICY "Members can view their couple chapters"
ON public.monthly_chapters FOR SELECT
TO authenticated
USING (public.is_member_of_couple(couple_id));

CREATE POLICY "Members can insert their couple chapters"
ON public.monthly_chapters FOR INSERT
TO authenticated
WITH CHECK (public.is_member_of_couple(couple_id));

CREATE POLICY "Members can update their couple chapters"
ON public.monthly_chapters FOR UPDATE
TO authenticated
USING (public.is_member_of_couple(couple_id));

-- Entries policies
CREATE POLICY "Members can view entries in their chapters"
ON public.entries FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.monthly_chapters c
        WHERE c.id = entries.chapter_id
          AND public.is_member_of_couple(c.couple_id)
    )
);

CREATE POLICY "Members can insert entries into their chapters"
ON public.entries FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.monthly_chapters c
        WHERE c.id = entries.chapter_id
          AND public.is_member_of_couple(c.couple_id)
    )
);

CREATE POLICY "Members can update entries in their chapters"
ON public.entries FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.monthly_chapters c
        WHERE c.id = entries.chapter_id
          AND public.is_member_of_couple(c.couple_id)
    )
);

CREATE POLICY "Members can delete entries in their chapters"
ON public.entries FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.monthly_chapters c
        WHERE c.id = entries.chapter_id
          AND public.is_member_of_couple(c.couple_id)
    )
);

-- Rankings policies
CREATE POLICY "Members can view rankings in their couple chapters"
ON public.rankings FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.entries e
        JOIN public.monthly_chapters c ON c.id = e.chapter_id
        WHERE e.id = rankings.entry_id
          AND public.is_member_of_couple(c.couple_id)
    )
);

CREATE POLICY "Users can create their own rankings"
ON public.rankings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own rankings"
ON public.rankings FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Keepsakes policies
CREATE POLICY "Members can view shared or author's keepsakes"
ON public.keepsakes FOR SELECT
TO authenticated
USING (
    public.is_member_of_couple(couple_id)
    AND (
        NOT is_private_draft 
        OR author_id = auth.uid()
    )
    AND (
        unlock_at IS NULL 
        OR unlock_at <= timezone('utc'::text, now()) 
        OR author_id = auth.uid()
    )
);

CREATE POLICY "Users can insert keepsakes for their couple"
ON public.keepsakes FOR INSERT
TO authenticated
WITH CHECK (public.is_member_of_couple(couple_id) AND author_id = auth.uid());

CREATE POLICY "Users can update their own keepsakes"
ON public.keepsakes FOR UPDATE
TO authenticated
USING (author_id = auth.uid());

-- ------------------------------------------------------------------------------
-- Storage Setup for Private Bucket 'memories'
-- ------------------------------------------------------------------------------
-- Insert bucket if storage schema exists
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('memories', 'memories', false)
    ON CONFLICT (id) DO NOTHING;
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;
