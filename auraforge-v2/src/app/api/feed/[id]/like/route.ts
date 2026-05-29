import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const ip = getClientIp(request)
  const rl = rateLimit(`like:${ip}`, 20, 60_000)
  if (!rl.success) return NextResponse.json({ error: 'Too fast' }, { status: 429 })

  const supabase = createAdminClient()
  
  // Simple increment via raw SQL
  await supabase.rpc('increment_feed_likes', { p_feed_id: params.id }).throwOnError()
  
  return NextResponse.json({ success: true })
}
