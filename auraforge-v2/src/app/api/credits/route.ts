import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { FREE_DAILY_CREDITS, AD_WATCH_BONUS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ used: 0, limit: FREE_DAILY_CREDITS, remaining: FREE_DAILY_CREDITS, is_premium: false })

  const { data } = await supabase
    .from('users')
    .select('credits_used, credits_limit, is_premium')
    .eq('id', user.id)
    .single()

  const used      = data?.credits_used  ?? 0
  const limit     = data?.is_premium ? null : (data?.credits_limit ?? FREE_DAILY_CREDITS)
  const remaining = data?.is_premium ? null : Math.max(0, (limit ?? FREE_DAILY_CREDITS) - used)

  return NextResponse.json({ used, limit, remaining, is_premium: data?.is_premium ?? false })
}

// ── NEW REQ 2: Earn credits endpoint ─────────────────────────
// POST /api/credits  body: { action: 'ad_watch' | 'referral_bonus' }
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const action = body?.action as string | undefined

  if (action === 'ad_watch') {
    // ── NEW REQ 2: Rewarded ad — give +2 credits ───────────
    // Verify ad completion token here if using a real ad network
    const adToken = body?.ad_token as string | undefined
    // In production: verify adToken with your ad network's server-side API
    // For now we trust the client (replace with real verification before launch)
    if (!adToken && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Ad verification required' }, { status: 400 })
    }

    // Check daily ad watch limit (max 3 times per day)
    const { data: profile } = await supabase
      .from('users')
      .select('ad_watches_today, is_premium')
      .eq('id', user.id)
      .single()

    if (profile?.is_premium) {
      return NextResponse.json({ error: 'Premium users have unlimited credits' }, { status: 400 })
    }

    const watchesToday = profile?.ad_watches_today ?? 0
    if (watchesToday >= 3) {
      return NextResponse.json({ error: 'Daily ad watch limit reached (3/day)' }, { status: 429 })
    }

    await supabase.rpc('earn_ad_credits', { p_user_id: user.id, p_bonus: AD_WATCH_BONUS })

    return NextResponse.json({ success: true, credits_earned: AD_WATCH_BONUS, message: `+${AD_WATCH_BONUS} credits added!` })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
