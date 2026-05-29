-- ============================================================
-- AuraForge Platform — Complete Supabase Schema v2
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id                              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                           TEXT,
  full_name                       TEXT,
  avatar_url                      TEXT,
  username                        TEXT UNIQUE,
  created_at                      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at                      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_premium                      BOOLEAN DEFAULT FALSE NOT NULL,
  premium_expires_at              TIMESTAMPTZ,
  -- Credits
  credits_used                    INTEGER DEFAULT 0 NOT NULL,
  credits_limit                   INTEGER DEFAULT 10 NOT NULL,
  -- Stripe
  stripe_customer_id              TEXT UNIQUE,
  -- Role
  role                            TEXT DEFAULT 'user' CHECK (role IN ('user','admin')) NOT NULL,
  -- Referral system (NEW REQ 2)
  referral_code                   TEXT UNIQUE DEFAULT UPPER(SUBSTRING(MD5(gen_random_uuid()::TEXT), 1, 8)),
  referred_by                     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  referral_count                  INTEGER DEFAULT 0 NOT NULL,
  credits_earned_from_referrals   INTEGER DEFAULT 0 NOT NULL,
  -- Ad watch tracking (NEW REQ 2)
  ad_watches_today                INTEGER DEFAULT 0 NOT NULL,
  ad_watches_reset_at             TIMESTAMPTZ DEFAULT NOW(),
  -- Stats
  total_generations               INTEGER DEFAULT 0 NOT NULL
);

-- ============================================================
-- GENERATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.generations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  tool_id     TEXT NOT NULL,
  tool_slug   TEXT NOT NULL,
  input       JSONB DEFAULT '{}',
  output      TEXT NOT NULL,
  share_id    TEXT UNIQUE,
  is_public   BOOLEAN DEFAULT FALSE NOT NULL,
  likes       INTEGER DEFAULT 0 NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- PUBLIC FEED TABLE (Phase 3 — Dynamic Community Feed)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.public_feed (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  generation_id  UUID UNIQUE REFERENCES public.generations(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES public.users(id) ON DELETE SET NULL,
  tool_slug      TEXT NOT NULL,
  tool_emoji     TEXT DEFAULT '✨',
  preview_text   TEXT NOT NULL,
  username       TEXT,                    -- NULL = anonymous
  share_id       TEXT,
  likes          INTEGER DEFAULT 0 NOT NULL,
  is_visible     BOOLEAN DEFAULT TRUE NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- LEADERBOARD TABLE (Phase 4)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_item_id UUID UNIQUE REFERENCES public.public_feed(id) ON DELETE CASCADE,
  tool_slug    TEXT NOT NULL,
  category     TEXT NOT NULL,           -- 'most_brutal_roast', 'rarest_aura', etc.
  preview_text TEXT NOT NULL,
  username     TEXT,
  score        INTEGER DEFAULT 0 NOT NULL,
  week_start   DATE NOT NULL DEFAULT DATE_TRUNC('week', NOW())::DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_subscription_id  TEXT UNIQUE NOT NULL,
  stripe_price_id         TEXT NOT NULL,
  status                  TEXT DEFAULT 'active' CHECK (status IN ('active','canceled','past_due','trialing')) NOT NULL,
  current_period_start    TIMESTAMPTZ DEFAULT NOW(),
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN DEFAULT FALSE,
  created_at              TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_generations_user_id    ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_tool_slug  ON public.generations(tool_slug);
CREATE INDEX IF NOT EXISTS idx_generations_share_id   ON public.generations(share_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_feed_visible    ON public.public_feed(is_visible, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_feed_tool       ON public.public_feed(tool_slug);
CREATE INDEX IF NOT EXISTS idx_leaderboard_week       ON public.leaderboard(week_start, score DESC);
CREATE INDEX IF NOT EXISTS idx_users_email            ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code    ON public.users(referral_code);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_feed   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard   ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "users_select_own"   ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own"   ON public.users FOR UPDATE USING (auth.uid() = id);

-- Generations
CREATE POLICY "generations_select" ON public.generations FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);
CREATE POLICY "generations_insert" ON public.generations FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "generations_update" ON public.generations FOR UPDATE USING (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "subscriptions_own"  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Public feed — anyone can read
CREATE POLICY "feed_public_read"   ON public.public_feed FOR SELECT USING (is_visible = TRUE);
CREATE POLICY "feed_insert_auth"   ON public.public_feed FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leaderboard — public read
CREATE POLICY "leaderboard_read"   ON public.leaderboard FOR SELECT USING (TRUE);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    full_name  = COALESCE(EXCLUDED.full_name, public.users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Increment credits used (atomic)
CREATE OR REPLACE FUNCTION public.increment_credits(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.users
  SET credits_used = credits_used + 1, updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- Increment total generations
CREATE OR REPLACE FUNCTION public.increment_total_generations(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.users
  SET total_generations = total_generations + 1, updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- NEW REQ 2: Earn credits from watching ad
CREATE OR REPLACE FUNCTION public.earn_ad_credits(p_user_id UUID, p_bonus INTEGER DEFAULT 2)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_reset_at TIMESTAMPTZ;
  v_watches  INTEGER;
BEGIN
  SELECT ad_watches_reset_at, ad_watches_today INTO v_reset_at, v_watches
  FROM public.users WHERE id = p_user_id;

  -- Reset counter if it's a new day
  IF v_reset_at < DATE_TRUNC('day', NOW()) THEN
    UPDATE public.users
    SET ad_watches_today = 1,
        ad_watches_reset_at = NOW(),
        credits_used = GREATEST(0, credits_used - p_bonus),
        updated_at = NOW()
    WHERE id = p_user_id;
  ELSE
    IF v_watches >= 3 THEN
      RAISE EXCEPTION 'Daily ad watch limit reached';
    END IF;
    UPDATE public.users
    SET ad_watches_today = ad_watches_today + 1,
        credits_used = GREATEST(0, credits_used - p_bonus),
        updated_at = NOW()
    WHERE id = p_user_id;
  END IF;
END;
$$;

-- NEW REQ 2: Apply referral bonus (credits referrer, marks new user)
CREATE OR REPLACE FUNCTION public.apply_referral_bonus(
  p_referrer_id UUID,
  p_new_user_id UUID,
  p_bonus       INTEGER DEFAULT 5
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Give referrer extra credits by reducing their credits_used
  UPDATE public.users
  SET credits_used = GREATEST(0, credits_used - p_bonus),
      referral_count = referral_count + 1,
      credits_earned_from_referrals = credits_earned_from_referrals + p_bonus,
      updated_at = NOW()
  WHERE id = p_referrer_id;

  -- Mark new user as referred
  UPDATE public.users
  SET referred_by = p_referrer_id, updated_at = NOW()
  WHERE id = p_new_user_id;
END;
$$;

-- Daily credit reset (called by cron)
CREATE OR REPLACE FUNCTION public.reset_daily_credits()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.users
  SET credits_used = 0,
      ad_watches_today = 0,
      ad_watches_reset_at = NOW(),
      updated_at = NOW()
  WHERE is_premium = FALSE;
END;
$$;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS users_updated_at ON public.users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- ENABLE REALTIME (for live credit badge updates - NEW REQ 1)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.public_feed;

-- ============================================================
-- PERMISSIONS
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.public_feed, public.leaderboard TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.generations TO authenticated;
GRANT SELECT, INSERT ON public.public_feed TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_credits              TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_total_generations    TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.earn_ad_credits                TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.apply_referral_bonus           TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_daily_credits            TO service_role;

-- ============================================================
-- SEED INITIAL DATA
-- ============================================================
-- Set yourself as admin after running:
-- UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';

-- ============================================================
-- DONE ✅
-- ============================================================
