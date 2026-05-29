import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { REFERRAL_BONUS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

// GET /api/referral  — fetch referral stats for dashboard
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('referral_code, referral_count, credits_earned_from_referrals')
    .eq('id', user.id)
    .single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://auraforge.app'
  const referralLink = `${appUrl}/signup?ref=${profile?.referral_code ?? ''}`

  return NextResponse.json({
    code:           profile?.referral_code ?? '',
    link:           referralLink,
    total_referrals: profile?.referral_count ?? 0,
    credits_earned: profile?.credits_earned_from_referrals ?? 0,
    bonus_per_referral: REFERRAL_BONUS,
  })
}

// POST /api/referral  — called at signup to credit the referrer
// body: { referral_code: string }
export async function POST(request: NextRequest) {
  const supabase      = createClient()
  const adminSupabase = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { referral_code } = await request.json().catch(() => ({}))
  if (!referral_code) return NextResponse.json({ error: 'No referral code' }, { status: 400 })

  // Find referrer
  const { data: referrer } = await adminSupabase
    .from('users')
    .select('id, referral_code')
    .eq('referral_code', referral_code.toUpperCase())
    .single()

  if (!referrer || referrer.id === user.id) {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
  }

  // Check the new user hasn't already been referred
  const { data: newUser } = await adminSupabase
    .from('users')
    .select('referred_by')
    .eq('id', user.id)
    .single()

  if (newUser?.referred_by) {
    return NextResponse.json({ error: 'Already referred' }, { status: 400 })
  }

  // Apply referral: credit referrer + mark new user as referred
  await Promise.allSettled([
    adminSupabase.rpc('apply_referral_bonus', {
      p_referrer_id: referrer.id,
      p_new_user_id: user.id,
      p_bonus: REFERRAL_BONUS,
    }),
  ])

  return NextResponse.json({ success: true, message: `Referrer got +${REFERRAL_BONUS} credits!` })
}
