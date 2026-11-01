-- ==============================================================================
-- Ever, Together ♡ — Supabase Schema for His (Google 🧸) & Hers (Nami 🐶)
-- Run this entire script in your Supabase Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. Create the His & Hers Monthly Logs table
CREATE TABLE IF NOT EXISTS public.couple_monthly_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perspective TEXT NOT NULL CHECK (perspective IN ('his', 'her')), -- 'his' = Google, 'her' = Nami
    month_id TEXT NOT NULL, -- e.g. '2026-10', '2026-11'
    year INT NOT NULL CHECK (year >= 2020),
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    month_name TEXT NOT NULL,
    music_song JSONB,
    movie_log JSONB,
    game_log JSONB,
    food_log JSONB,
    memory_log JSONB,
    categories JSONB NOT NULL DEFAULT '{
      "movie": {"category_slug": "movie"},
      "game": {"category_slug": "game"},
      "food": {"category_slug": "food"},
      "memory": {"category_slug": "memory"},
      "music": {"category_slug": "music"}
    }'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (perspective, month_id)
);

-- 2. Helpful index for fast lookups by perspective & chronological month
CREATE INDEX IF NOT EXISTS idx_couple_monthly_logs_lookup
ON public.couple_monthly_logs (perspective, year DESC, month DESC);

-- 3. Automatically update `updated_at` on every change
CREATE OR REPLACE FUNCTION public.touch_couple_monthly_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_couple_monthly_logs_updated_at ON public.couple_monthly_logs;
CREATE TRIGGER trg_couple_monthly_logs_updated_at
    BEFORE UPDATE ON public.couple_monthly_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_couple_monthly_logs_updated_at();

-- 4. Enable Row Level Security (RLS) with open couple policies for anon/authenticated keys
ALTER TABLE public.couple_monthly_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read of couple_monthly_logs" ON public.couple_monthly_logs;
CREATE POLICY "Allow public read of couple_monthly_logs"
    ON public.couple_monthly_logs
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public insert of couple_monthly_logs" ON public.couple_monthly_logs;
CREATE POLICY "Allow public insert of couple_monthly_logs"
    ON public.couple_monthly_logs
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update of couple_monthly_logs" ON public.couple_monthly_logs;
CREATE POLICY "Allow public update of couple_monthly_logs"
    ON public.couple_monthly_logs
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete of couple_monthly_logs" ON public.couple_monthly_logs;
CREATE POLICY "Allow public delete of couple_monthly_logs"
    ON public.couple_monthly_logs
    FOR DELETE
    USING (true);

-- 5. Enable Realtime replication so His & Hers sync live across devices
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'couple_monthly_logs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_monthly_logs;
    END IF;
END $$;
