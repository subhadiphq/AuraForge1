import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateAI, TOOL_PROMPTS, type ToolSlug } from '@/lib/ai/provider'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { sanitizeInput, generateShareId } from '@/lib/utils'
import { FREE_DAILY_CREDITS, ANON_FREE_CREDITS } from '@/lib/constants'
import type { ModelTier } from '@/lib/ai/openrouter'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  tool_slug: z.string().min(1).max(60),
  input:     z.string().min(3).max(5000),
  platform:  z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // ── 1. IP rate limiting ──────────────────────────────────
    const ip = getClientIp(request)
    const rl  = rateLimit(`ai:${ip}`, 30, 60_000)
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Slow down!' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
      )
    }

    // ── 2. Parse & validate body ─────────────────────────────
    let body: z.infer<typeof BodySchema>
    try { body = BodySchema.parse(await request.json()) }
    catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }

    const { tool_slug, input, platform } = body
    if (!(tool_slug in TOOL_PROMPTS)) {
      return NextResponse.json({ error: 'Unknown tool' }, { status: 400 })
    }

    const cleanInput = sanitizeInput(input)
    if (cleanInput.length < 3) {
      return NextResponse.json({ error: 'Input too short' }, { status: 400 })
    }

    // ── 3. Auth check + credit system ───────────────────────
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let isPremium   = false
    let userId: string | null = null
    let modelTier: ModelTier  = 'free'

    if (user) {
      userId = user.id

      // Fetch profile with subscription status
      const { data: profile } = await supabase
        .from('users')
        .select('is_premium, credits_used, credits_limit')
        .eq('id', user.id)
        .single()

      isPremium = profile?.is_premium ?? false

      // ── NEW REQ 3: Set model tier based on subscription ──
      modelTier = isPremium ? 'premium' : 'free'

      // Credit enforcement for free users
      if (!isPremium) {
        const used  = profile?.credits_used  ?? 0
        const limit = profile?.credits_limit ?? FREE_DAILY_CREDITS
        if (used >= limit) {
          return NextResponse.json(
            { error: 'daily_limit_reached', message: 'Daily credits exhausted. Upgrade to Pro for unlimited!' },
            { status: 402 },
          )
        }
      }
    } else {
      // ── NEW REQ 1: Anonymous enforcement ────────────────
      // Allow exactly ANON_FREE_CREDITS generations without login
      const anonRl = rateLimit(`anon:${ip}`, ANON_FREE_CREDITS, 86_400_000) // per day
      if (!anonRl.success) {
        return NextResponse.json(
          { error: 'auth_required', message: 'Sign up free to get 10 daily credits!' },
          { status: 401 },
        )
      }
    }

    // ── 4. Generate ─────────────────────────────────────────
    const toolConfig = TOOL_PROMPTS[tool_slug as ToolSlug]
    const prompt     = toolConfig.userPrompt(
      platform ? `${cleanInput} (Platform: ${platform})` : cleanInput,
    )

    const aiResponse = await generateAI(
      { prompt, system: toolConfig.system, tool_slug, user_id: userId ?? undefined, max_tokens: 1200, temperature: 0.85 },
      modelTier,
    )

    // ── 5. Parse JSON from AI ────────────────────────────────
    let result: Record<string, unknown>
    try {
      const clean = aiResponse.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      result = JSON.parse(clean)
    } catch {
      result = { result: aiResponse.content }
    }

    // ── 6. Persist + deduct credit atomically ────────────────
    const shareId = generateShareId()
    if (userId) {
      await Promise.allSettled([
        supabase.from('generations').insert({
          user_id: userId, tool_id: tool_slug, tool_slug,
          input: { text: cleanInput, platform },
          output: aiResponse.content,
          share_id: shareId,
          is_public: false,
        }),
        // ── NEW REQ 1: Atomically deduct 1 credit ──
        !isPremium && supabase.rpc('increment_credits', { p_user_id: userId }),
        supabase.rpc('increment_total_generations', { p_user_id: userId }),
      ])
    }

    return NextResponse.json({ result, share_id: shareId, model: aiResponse.model })
  } catch (err) {
    console.error('[AI API]', err)
    return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 500 })
  }
}
