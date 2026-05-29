import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// GET /api/feed — public feed (latest public generations)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit  = Math.min(parseInt(searchParams.get('limit') ?? '12'), 50)
  const cursor = searchParams.get('cursor') ?? null

  const supabase = createAdminClient()

  let query = supabase
    .from('public_feed')
    .select('id, tool_slug, tool_emoji, preview_text, username, likes, created_at, share_id')
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cursor) query = query.lt('created_at', cursor)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    items: data ?? [],
    next_cursor: data && data.length === limit ? data[data.length - 1].created_at : null,
  })
}

const PostSchema = z.object({
  generation_id: z.string().uuid(),
  anonymous: z.boolean().default(true),
  preview_override: z.string().max(200).optional(),
})

// POST /api/feed — share a generation to the public feed
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  let body: z.infer<typeof PostSchema>
  try { body = PostSchema.parse(await request.json()) }
  catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const admin = createAdminClient()

  // Fetch the generation
  const { data: gen } = await admin
    .from('generations')
    .select('id, tool_slug, output, share_id, user_id')
    .eq('id', body.generation_id)
    .eq('user_id', user.id)
    .single()

  if (!gen) return NextResponse.json({ error: 'Generation not found' }, { status: 404 })

  // Parse output for preview
  let preview = body.preview_override ?? ''
  if (!preview) {
    try {
      const parsed = JSON.parse(gen.output)
      const first  = Object.values(parsed).find((v): v is string => typeof v === 'string' && v.length > 10)
      preview = first?.slice(0, 180) ?? gen.output.slice(0, 180)
    } catch { preview = gen.output.slice(0, 180) }
  }

  // Get username if not anonymous
  let username: string | null = null
  if (!body.anonymous) {
    const { data: profile } = await admin.from('users').select('full_name, username').eq('id', user.id).single()
    username = profile?.username ?? profile?.full_name?.split(' ')[0] ?? null
  }

  const { data: feedItem, error } = await admin.from('public_feed').upsert({
    generation_id: gen.id,
    user_id:       user.id,
    tool_slug:     gen.tool_slug,
    tool_emoji:    getEmoji(gen.tool_slug),
    preview_text:  preview,
    username,
    share_id:      gen.share_id,
    is_visible:    true,
  }, { onConflict: 'generation_id' }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Mark generation as public
  await admin.from('generations').update({ is_public: true }).eq('id', gen.id)

  return NextResponse.json({ success: true, feed_item: feedItem })
}

function getEmoji(slug: string): string {
  const map: Record<string, string> = {
    'ai-roast-me': '🔥', 'personality-scanner': '🧠', 'aura-detector': '✨',
    'future-self': '🚀', 'creator-toolkit': '🎨', 'ai-caption': '📸',
    'ai-title-generator': '🎯', 'resume-helper': '💼',
  }
  return map[slug] ?? '✨'
}
