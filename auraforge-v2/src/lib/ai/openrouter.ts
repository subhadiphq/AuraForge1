import type { AiRequest, AiResponse } from '@/types'

const BASE_URL = 'https://openrouter.ai/api/v1'

// ─────────────────────────────────────────────────────────────
// NEW REQ 3: Zero-cost routing
//   free  → always-free OpenRouter models (no API cost)
//   fast  → cheap paid models (~$0.0001/1K tokens)
//   premium → GPT-4o / Claude 3.5 ONLY for paying subscribers
// ─────────────────────────────────────────────────────────────
export const AI_MODELS = {
  // Completely free on OpenRouter (rate-limited but $0 cost)
  free: [
    'meta-llama/llama-3-8b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'google/gemma-7b-it:free',
  ],
  // Cheap paid — fallback when free models hit limits (~$0.0001/1K)
  fast: 'meta-llama/llama-3.1-8b-instruct',
  // Premium — ONLY for active Stripe subscribers
  premium: 'anthropic/claude-3.5-sonnet',
  vision: 'openai/gpt-4o',
} as const

export type ModelTier = 'free' | 'fast' | 'premium'

function pickFreeModel(): string {
  // Rotate between free models to spread load
  const models = AI_MODELS.free
  return models[Math.floor(Date.now() / 10_000) % models.length]
}

export async function callOpenRouter(
  request: AiRequest,
  tier: ModelTier = 'free',
): Promise<AiResponse> {
  const model =
    tier === 'premium' ? AI_MODELS.premium
    : tier === 'fast'  ? AI_MODELS.fast
    : pickFreeModel()

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://auraforge.app',
      'X-Title': 'AuraForge',
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(request.system ? [{ role: 'system', content: request.system }] : []),
        { role: 'user', content: request.prompt },
      ],
      max_tokens: request.max_tokens ?? 1000,
      temperature: request.temperature ?? 0.8,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter ${res.status}: ${err}`)
  }

  const data = await res.json()
  return {
    content: data.choices?.[0]?.message?.content ?? '',
    model: data.model ?? model,
    usage: {
      prompt_tokens:     data.usage?.prompt_tokens     ?? 0,
      completion_tokens: data.usage?.completion_tokens ?? 0,
      total_tokens:      data.usage?.total_tokens      ?? 0,
    },
  }
}
