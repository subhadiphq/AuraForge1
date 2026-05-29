<div align="center">

<img src="https://img.shields.io/badge/AuraForge-AI%20Platform-8b5cf6?style=for-the-badge&logo=sparkles&logoColor=white" alt="AuraForge" />

# ✨ AuraForge

### *The Viral AI Identity & Creator Tools Platform*

**Free. Shareable. Built to go viral.**

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![OpenRouter](https://img.shields.io/badge/OpenRouter_AI-FF6B35?style=flat-square&logo=openai&logoColor=white)](https://openrouter.ai)

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success?style=flat-square)](https://auraforge.app)
[![Users](https://img.shields.io/badge/Users-580K%2B-8b5cf6?style=flat-square)](https://auraforge.app)

<br/>

[🚀 **Live Demo**](https://auraforge.app) · [📖 **Docs**](https://docs.auraforge.app) · [🐛 **Issues**](https://github.com/auraforge-app/auraforge/issues) · [💬 **Discord**](https://discord.gg/auraforge)

<br/>

<img src="https://img.shields.io/badge/2.4M%2B-Generations-FF6B35?style=for-the-badge" />
<img src="https://img.shields.io/badge/580K%2B-Users-8b5cf6?style=for-the-badge" />
<img src="https://img.shields.io/badge/47-Countries-3ECF8E?style=for-the-badge" />

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [AI Tools](#-ai-tools)
- [Tech Stack](#-tech-stack)
- [Monetization](#-monetization)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Supabase Setup](#-supabase-setup)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [Credit System](#-credit-system)
- [Referral System](#-referral-system)
- [OG Image Generation](#-og-image-generation)
- [Security](#-security)
- [Performance](#-performance)
- [Contributing](#-contributing)

---

## 🌟 Overview

AuraForge is a **production-grade AI SaaS platform** built to go viral. It combines shareable AI identity tools with a creator content suite — giving users instant, beautiful results they *want* to post on TikTok, Instagram, and X.

The platform is engineered for **zero API cost on the free tier** (using OpenRouter's free model pool and Groq's free tier), while unlocking premium AI models exclusively for paying subscribers. Every architectural decision is made to maximize viral spread and minimize infrastructure cost.

### ✨ What makes it different

| Feature | AuraForge | Typical AI SaaS |
|---------|-----------|-----------------|
| Free model routing (zero cost) | ✅ Always-free OpenRouter models | ❌ Charges immediately |
| Shareable result cards | ✅ Dynamic OG images via Vercel | ❌ Static screenshots |
| Viral growth mechanics | ✅ Referral + rewarded ads | ❌ None |
| Real-time credit UI | ✅ Supabase Realtime | ❌ Page refresh required |
| Community feed | ✅ Live public generations | ❌ Not built |
| Auth gate (anti-abuse) | ✅ 1 anon use → sign-up wall | ❌ Open to bots |
| Desktop split-screen UX | ✅ Input + live preview | ❌ Sequential flow |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL EDGE                              │
│  ┌──────────────┐  ┌─────────────────┐  ┌───────────────────┐  │
│  │  Next.js 14  │  │  API Routes     │  │  Edge Functions   │  │
│  │  App Router  │  │  (Node runtime) │  │  OG Images        │  │
│  │  SSR + ISR   │  │  /api/ai        │  │  /api/og          │  │
│  └──────────────┘  │  /api/credits   │  └───────────────────┘  │
│                    │  /api/feed      │                          │
│                    │  /api/referral  │                          │
│                    │  /api/stripe    │                          │
│                    └─────────────────┘                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
           ┌──────────────┼──────────────────┐
           │              │                  │
    ┌──────▼──────┐  ┌────▼─────┐  ┌────────▼────────┐
    │  Supabase   │  │  Stripe  │  │  AI Providers   │
    │             │  │          │  │                  │
    │  PostgreSQL │  │ Payments │  │ ① OpenRouter     │
    │  Auth       │  │ Webhooks │  │   Free models:   │
    │  Storage    │  │ Portal   │  │   llama-3-8b     │
    │  Realtime   │  └──────────┘  │   mistral-7b     │
    │  RLS        │                │   gemma-7b       │
    └─────────────┘                │                  │
                                   │ ② Groq (fallback)│
                                   │   llama3-8b      │
                                   │                  │
                                   │ ③ Premium only:  │
                                   │   Claude 3.5     │
                                   │   (Stripe sub)   │
                                   └──────────────────┘
```

### 🤖 Zero-Cost AI Routing Logic

```
User generates →
  Is user Premium (active Stripe sub)?
    ✅ YES → Claude 3.5 Sonnet (OpenRouter paid)
    ❌ NO  →
      Try OpenRouter free pool (llama-3-8b:free, mistral-7b:free, gemma-7b:free)
        ✅ Success → Return result
        ❌ Rate limited → Fallback to Groq free tier (llama3-8b-8192)
          ✅ Success → Return result
          ❌ Failed → 503 "AI temporarily unavailable"
```

---

## 🛠 AI Tools

| # | Tool | Slug | Input | Output | Category |
|---|------|------|-------|--------|----------|
| 🔥 | **AI Roast Me** | `ai-roast-me` | Bio / description | Roast, vibe, archetype, savage score | Fun |
| 🧠 | **Personality Scanner** | `personality-scanner` | Free-form text | MBTI-style type, creator archetype, viral potential | Identity |
| ✨ | **Aura Detector** | `aura-detector` | Personality description | Aura color, element, power, energy level | Identity |
| 🚀 | **AI Future Self** | `future-self` | Current life description | Future job, achievement, plot twist, life advice | Fun |
| 🎨 | **Creator Toolkit** | `creator-toolkit` | Niche/topic | Bio (4 platforms), captions, hashtags, hooks, titles | Creator |
| 📸 | **Caption Generator** | `ai-caption` | Post description | 3 caption styles + hashtags (platform-optimized) | Creator |
| 🎯 | **YouTube Title AI** | `ai-title-generator` | Video topic | 5 title variants + SEO score | Creator |
| 💼 | **Resume Helper** | `resume-helper` | Resume bullets / experience | Improved bullets, LinkedIn summary, ATS score | Career |

Each tool page features:
- **Desktop split-screen layout** — input left, live result preview right
- **Example pills** — one-click prompt templates to reduce friction
- **How it Works** section
- **Related tools** cross-promotion
- **Tool-specific FAQ** (SEO structured data)

---

## 💻 Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| [Next.js](https://nextjs.org) | 14.2.x | App Router, SSR, ISR, API Routes |
| [TypeScript](https://typescriptlang.org) | 5.x | End-to-end type safety |
| [Tailwind CSS](https://tailwindcss.com) | 3.4.x | Utility-first styling |
| [Framer Motion](https://framer-motion.com) | 11.x | Animations & transitions |
| [Lucide React](https://lucide.dev) | latest | Icon system |
| [@vercel/og](https://vercel.com/docs/functions/og-image-generation) | 0.6.x | Dynamic OG image generation |

### Backend
| Technology | Purpose |
|-----------|---------|
| [Supabase](https://supabase.com) | PostgreSQL + Auth + Realtime + Storage |
| [Stripe](https://stripe.com) | Subscriptions, webhooks, billing portal |
| [OpenRouter](https://openrouter.ai) | Multi-model AI API (primary, free + paid models) |
| [Groq](https://console.groq.com) | Ultra-fast AI fallback (free tier) |
| [Zod](https://zod.dev) | Runtime request validation |

### Infrastructure
| Service | Purpose |
|---------|---------|
| [Vercel](https://vercel.com) | Hosting, Edge Functions, Cron Jobs |
| Supabase Realtime | Live credit badge updates |
| Vercel Cron | Daily credit reset at midnight UTC |

---

## 💰 Monetization

### Revenue Streams

```
┌─────────────────────────────────────────────────────────┐
│                   MONETIZATION STACK                      │
├─────────────────┬─────────────────┬──────────────────────┤
│   FREEMIUM      │   SUBSCRIPTION  │   ADVERTISING        │
│                 │                 │                      │
│  10 credits/day │  Pro: $9.99/mo  │  Google AdSense      │
│  Free tools     │  or $79.99/yr   │  (free-tier pages)   │
│  Watermarked    │                 │                      │
│  exports        │  Unlimited gen  │  Rewarded Ads        │
│                 │  Premium AI     │  +2 credits per view │
│  Growth hook:   │  No watermark   │  (pluggable SDK)     │
│  Auth gate      │  Ad-free UX     │                      │
│  after 1 anon   │  Faster models  │  Max 3 watches/day   │
│  generation     │  Pro badge      │  = 6 bonus credits   │
└─────────────────┴─────────────────┴──────────────────────┘
```

### Free Tier Cost Analysis (per user/day)

| Component | Cost |
|-----------|------|
| OpenRouter free models | **$0.00** |
| Groq free tier fallback | **$0.00** |
| Supabase free tier (500MB DB, 2GB bandwidth) | **~$0.00** |
| Vercel free tier (100GB bandwidth) | **~$0.00** |
| **Total free user cost** | **≈ $0.00** |

> Free users are 100% covered by the free tiers of our providers. Only Pro users trigger paid API calls.

---

## 📁 Project Structure

```
auraforge/
│
├── 📁 src/
│   ├── 📁 app/                          # Next.js App Router pages
│   │   ├── 📁 (auth)/                   # Auth group (no navbar)
│   │   │   ├── login/page.tsx           # Magic link + Google OAuth
│   │   │   └── signup/page.tsx          # Signup with referral code support
│   │   │
│   │   ├── 📁 (seo)/ai/[tool]/          # Programmatic SEO landing pages
│   │   │
│   │   ├── 📁 api/                      # API Routes
│   │   │   ├── ai/route.ts              # 🤖 Core AI generation endpoint
│   │   │   ├── auth/callback/route.ts   # OAuth callback handler
│   │   │   ├── credits/route.ts         # Credit management + earn
│   │   │   ├── feed/route.ts            # Community feed (GET/POST)
│   │   │   ├── feed/[id]/like/route.ts  # Like a feed item
│   │   │   ├── og/route.tsx             # Dynamic OG image generation
│   │   │   ├── referral/route.ts        # Referral system
│   │   │   ├── stripe/checkout/         # Stripe checkout session
│   │   │   ├── stripe/webhook/          # Stripe webhook handler
│   │   │   └── cron/reset-credits/      # Daily credit reset
│   │   │
│   │   ├── 📁 tools/                    # AI Tool pages (split-screen layout)
│   │   │   ├── ai-roast-me/
│   │   │   ├── personality-scanner/
│   │   │   ├── aura-detector/
│   │   │   ├── future-self/
│   │   │   ├── creator-toolkit/
│   │   │   ├── ai-caption/
│   │   │   ├── ai-title-generator/
│   │   │   └── resume-helper/
│   │   │
│   │   ├── 📁 dashboard/                # User dashboard (protected)
│   │   ├── 📁 admin/                    # Admin panel (role-gated)
│   │   ├── 📁 leaderboard/              # Community Wall of Fame
│   │   ├── 📁 blog/                     # Blog listing + posts
│   │   ├── 📁 share/[id]/               # Public result share pages
│   │   ├── 📁 pricing/                  # Pricing comparison
│   │   ├── about/, privacy/, terms/     # Static legal/info pages
│   │   ├── cookies/, contact/,          #
│   │   ├── careers/, changelog/         #
│   │   │
│   │   ├── layout.tsx                   # Root layout (fonts, analytics, toast)
│   │   ├── page.tsx                     # Homepage
│   │   ├── sitemap.ts                   # Dynamic XML sitemap
│   │   ├── robots.ts                    # robots.txt
│   │   ├── not-found.tsx                # 404 page
│   │   ├── error.tsx                    # Error boundary
│   │   └── globals.css                  # Global styles + CSS variables
│   │
│   ├── 📁 components/
│   │   ├── 📁 home/                     # Homepage sections
│   │   │   ├── HeroSection.tsx          # ✅ Fixed typing animation
│   │   │   ├── TrendingTools.tsx
│   │   │   ├── CommunityFeed.tsx        # ✅ Dynamic Supabase feed
│   │   │   ├── TestimonialsSection.tsx
│   │   │   ├── PricingSection.tsx
│   │   │   └── FAQSection.tsx
│   │   │
│   │   ├── 📁 tools/
│   │   │   ├── ToolPageWrapper.tsx      # ✅ Split-screen layout + FAQ + related
│   │   │   ├── ExamplePills.tsx         # ✅ Quick-fill prompt templates
│   │   │   └── ResultCard.tsx           # ✅ Fixed share URL + download
│   │   │
│   │   ├── 📁 shared/
│   │   │   ├── AuthGateModal.tsx        # ✅ Force signup after 1 anon use
│   │   │   ├── CreditBadge.tsx          # ✅ Real-time credit display
│   │   │   ├── EarnCreditsModal.tsx     # ✅ Ad watch + referral tabs
│   │   │   ├── SharePageClient.tsx      # ✅ Native share + OG image
│   │   │   ├── Analytics.tsx            # GA4 + PostHog + Clarity
│   │   │   └── AdSlot.tsx               # AdSense slot component
│   │   │
│   │   ├── 📁 layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx               # ✅ 'use client' added
│   │   │
│   │   ├── 📁 dashboard/
│   │   │   └── DashboardContent.tsx     # ✅ Referrals tab + earn modal
│   │   │
│   │   └── 📁 ui/                       # Base components (button, card, input)
│   │
│   ├── 📁 lib/
│   │   ├── 📁 ai/
│   │   │   ├── openrouter.ts            # ✅ Zero-cost free model routing
│   │   │   ├── groq.ts                  # ✅ Free tier fallback
│   │   │   └── provider.ts              # ✅ Tier routing (free→fast→premium)
│   │   │
│   │   ├── 📁 supabase/
│   │   │   ├── client.ts                # Browser client (singleton)
│   │   │   └── server.ts                # Server client + admin client
│   │   │
│   │   ├── constants.ts                 # App constants, credit limits
│   │   ├── rate-limit.ts                # ✅ Fixed MapIterator TS error
│   │   ├── stripe.ts                    # Stripe client + checkout helpers
│   │   └── utils.ts                     # Helpers (cn, formatNumber, etc.)
│   │
│   ├── 📁 hooks/
│   │   ├── useAuth.ts                   # Auth state + session
│   │   └── useCredits.ts                # ✅ Real-time Supabase subscription
│   │
│   └── 📁 types/
│       └── index.ts                     # Shared TypeScript types
│
├── 📁 supabase/
│   └── schema.sql                       # ✅ Complete schema v2
│                                        #   Tables: users, generations,
│                                        #   public_feed, leaderboard,
│                                        #   subscriptions
│                                        #   Functions: earn_ad_credits,
│                                        #   apply_referral_bonus,
│                                        #   reset_daily_credits
│
├── middleware.ts                         # Auth route protection
├── next.config.js                        # Image domains, security headers
├── tailwind.config.ts                    # Design tokens, animations
├── vercel.json                           # Cron jobs, regions
├── .env.example                          # Environment variable template
├── DEPLOYMENT.md                         # Full deployment guide
└── README.md                             # This file
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js **18+**
- A [Supabase](https://supabase.com) account (free)
- An [OpenRouter](https://openrouter.ai) API key (free models available)
- A [Groq](https://console.groq.com) API key (free)

### 1. Clone & Install

```bash
git clone https://github.com/auraforge-app/auraforge.git
cd auraforge
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Fill in your values — see Environment Variables section below
```

### 3. Set up Supabase database

```bash
# In Supabase Dashboard → SQL Editor → paste and run:
cat supabase/schema.sql
```

### 4. Run development server

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Verify everything works

```
✓ Homepage loads with animated hero
✓ Visit /tools/ai-roast-me → type anything → click "Roast Me"
✓ Anonymous: AuthGateModal appears after 1 generation
✓ Sign in → generate again → credits decrease in real-time
✓ Dashboard → Earn Credits → EarnCreditsModal opens
✓ Share a result → URL is http://localhost:3000/share/... (not undefined)
```

---

## 🔐 Environment Variables

Create `.env.local` in your project root:

```bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SUPABASE — https://supabase.com/dashboard
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# AI PROVIDERS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# OpenRouter — https://openrouter.ai/keys
# Free models: llama-3-8b:free, mistral-7b:free, gemma-7b:free
OPENROUTER_API_KEY=sk-or-v1-...

# Groq — https://console.groq.com/keys
# Free: llama3-8b-8192 (30k tokens/min)
GROQ_API_KEY=gsk_...

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STRIPE — https://dashboard.stripe.com
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...       # $9.99/month
STRIPE_PRICE_ID_YEARLY=price_...        # $79.99/year

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# APP — Critical: fixes "undefined" in share URLs
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT_PUBLIC_APP_URL=https://auraforge.app   # NO trailing slash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ANALYTICS (all optional)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_CLARITY_PROJECT_ID=xxxxxxxxxx

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ADSENSE (optional)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-...

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECURITY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRON_SECRET=your-random-cron-secret-min-32-chars
```

> ⚠️ **`NEXT_PUBLIC_APP_URL` is critical.** Without it, all share links render as `undefined/share/...`

---

## 🗄 Supabase Setup

### Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Profiles, credits, referral data, Stripe customer ID |
| `generations` | Every AI generation (linked to user, tool, output) |
| `public_feed` | Community-shared generations with likes |
| `leaderboard` | Weekly top results by category |
| `subscriptions` | Stripe subscription tracking |

### Key Functions (called from API routes)

```sql
-- Deduct 1 credit atomically
SELECT increment_credits('user-uuid');

-- Award referral bonus (+5 credits to referrer)
SELECT apply_referral_bonus('referrer-uuid', 'new-user-uuid', 5);

-- Award ad watch bonus (+2 credits, max 3/day)
SELECT earn_ad_credits('user-uuid', 2);

-- Reset all free user credits at midnight (called by Vercel Cron)
SELECT reset_daily_credits();
```

### Enable Realtime (required for live credit badge)

In Supabase Dashboard → Database → Replication → enable for `users` table.
*(The schema SQL handles this automatically via `ALTER PUBLICATION`.)*

### Set yourself as Admin

After your first login, run in SQL Editor:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 🚀 Deployment

### Deploy to Vercel (recommended)

```bash
# Option A: Vercel CLI
npm i -g vercel
vercel --prod

# Option B: GitHub integration
# 1. Push to GitHub
# 2. Import at vercel.com/new
# 3. Add all environment variables
# 4. Deploy
```

### Vercel Cron Jobs (auto-configured via vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/cron/reset-credits",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Stripe Webhooks

Add endpoint in Stripe Dashboard → Webhooks:
- URL: `https://yourdomain.com/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

---

## 📡 API Reference

### `POST /api/ai`
Core generation endpoint.

```typescript
// Request
{
  tool_slug: string,    // e.g. "ai-roast-me"
  input: string,        // 3-5000 chars
  platform?: string     // "instagram" | "tiktok" | "twitter" | "linkedin"
}

// Response
{
  result: Record<string, unknown>,  // JSON from AI
  share_id: string,                 // 10-char share identifier
  model: string                     // model used
}

// Error codes
// 401 auth_required  → Show AuthGateModal
// 402 daily_limit_reached → Show upgrade CTA
// 429 → Rate limited (30 req/min per IP)
```

### `GET /api/feed?limit=12`
Paginated public feed.

### `POST /api/credits` — `{ action: "ad_watch", ad_token: string }`
Award ad watch credits (+2, max 3/day).

### `GET /api/referral`
Fetch user's referral stats and link.

### `GET /api/og?tool=&emoji=&result=`
Edge function returning a 1200×630 PNG for social sharing.

---

## 🎯 Credit System

```
┌─────────────────────────────────────────────────────────┐
│                    CREDIT FLOW                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Anonymous user                                          │
│    └─ 1 free generation → AuthGateModal → Sign up        │
│                                                          │
│  Free user (logged in)                                   │
│    └─ 10 credits/day (resets midnight UTC)               │
│    └─ Earn more:                                         │
│         📺 Watch ad → +2 credits (max 3×/day = +6)       │
│         🎁 Refer friend → +5 credits (unlimited)         │
│    └─ Credits stored in users.credits_used (Supabase)    │
│    └─ Real-time UI via Supabase Realtime subscription    │
│                                                          │
│  Pro user (active Stripe subscription)                   │
│    └─ Unlimited generations                              │
│    └─ Premium AI models (Claude 3.5 / GPT-4o)           │
│    └─ No watermarks on exports                          │
│    └─ Ad-free experience                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎁 Referral System

Each user has a unique 8-character referral code (e.g. `AF7K2X1B`).

**Flow:**
1. User shares `https://auraforge.app/signup?ref=AF7K2X1B`
2. New user signs up via that link
3. Signup page calls `POST /api/referral` with the code
4. `apply_referral_bonus()` Postgres function atomically:
   - Reduces `credits_used` by 5 for the referrer (effectively giving +5 credits)
   - Increments referrer's `referral_count`
   - Sets `referred_by` on the new user

**Dashboard location:** Dashboard → Referrals tab

---

## 🖼 OG Image Generation

Dynamic branded images for every share URL, generated at the edge via `@vercel/og`.

```
https://auraforge.app/api/og
  ?tool=AI+Roast+Me
  &emoji=🔥
  &result=You+have+main+character+energy...
  &user=johndoe
  &g1=%23f97316
  &g2=%23ef4444
```

Returns a **1200×630 PNG** with:
- Dark gradient background with grid pattern
- Tool badge with gradient matching the tool's color
- Result text in a frosted glass card
- AuraForge branding + username

These are automatically injected into `<meta og:image>` on every `/share/[id]` page.

---

## 🔒 Security

| Mechanism | Implementation |
|-----------|---------------|
| **Route protection** | `middleware.ts` checks Supabase session |
| **Admin gating** | DB role check (`users.role = 'admin'`) |
| **Rate limiting** | IP-based in-memory store (30 req/min AI, 1/day anon) |
| **Input validation** | Zod schema on all API routes |
| **Input sanitization** | Strip HTML, limit length before AI prompt injection |
| **RLS** | Row Level Security on all Supabase tables |
| **Security headers** | `X-Frame-Options`, `X-XSS-Protection`, `nosniff` |
| **Webhook verification** | Stripe signature validation |
| **SQL injection** | Parameterized queries via Supabase client |

---

## ⚡ Performance

| Metric | Target | How |
|--------|--------|-----|
| Lighthouse score | 90+ | SSR, image optimization, font preload |
| LCP | < 2.5s | Hero image CDN, critical CSS inline |
| First AI response | < 3s | Groq fallback (fastest API available) |
| Credit badge update | < 500ms | Supabase Realtime WebSocket |
| OG image generation | < 800ms | Vercel Edge Function |
| Feed load | < 400ms | ISR + Supabase index optimization |

---

## 🗺 Roadmap

- [ ] 🎤 Voice input for tools
- [ ] 📱 React Native mobile app
- [ ] 🌍 Multi-language support (ES, PT, FR, HI)
- [ ] 🤖 AI-powered blog auto-generation
- [ ] 📊 Creator analytics dashboard
- [ ] 🔗 Zapier / Make.com integration
- [ ] 🏆 Weekly leaderboard email digest
- [ ] 💳 One-time credit packs (no subscription)
- [ ] 🎨 Custom branded result cards for Pro

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) first.

```bash
# Fork the repo, then:
git checkout -b feature/my-new-tool
git commit -m 'feat: add AI Dream Interpreter tool'
git push origin feature/my-new-tool
# Open a Pull Request
```

---

## 📄 License

MIT © 2025 AuraForge Team

---

<div align="center">

**Built with ❤️ for creators worldwide**

[auraforge.app](https://auraforge.app) · [@auraforge_app](https://twitter.com/auraforge_app) · [hello@auraforge.app](mailto:hello@auraforge.app)

<br/>

*If AuraForge helped you, please ⭐ the repo — it means a lot!*

</div>
