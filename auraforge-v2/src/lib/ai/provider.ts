import type { AiRequest, AiResponse } from '@/types'
import { callOpenRouter, type ModelTier } from './openrouter'
import { callGroq } from './groq'

// ─────────────────────────────────────────────────────────────
// NEW REQ 3: Tier routing rules
//   anonymous → free OpenRouter model (rotates between free models)
//   logged-in free → free OpenRouter model
//   logged-in Pro (active Stripe) → premium model (Claude 3.5 / GPT-4o)
// ─────────────────────────────────────────────────────────────
export async function generateAI(
  request: AiRequest,
  tier: ModelTier = 'free',
): Promise<AiResponse> {
  try {
    return await callOpenRouter(request, tier)
  } catch (err) {
    console.warn('[AI] OpenRouter failed, falling back to Groq:', err)
    try {
      return await callGroq(request)
    } catch (err2) {
      console.error('[AI] Both providers failed:', err2)
      throw new Error('AI service temporarily unavailable. Please try again.')
    }
  }
}

// ── Tool prompts ──────────────────────────────────────────────
export const TOOL_PROMPTS = {
  'ai-roast-me': {
    system: `You are a witty comedian AI delivering clever roasts. Funny, never mean-spirited.
Respond ONLY with valid JSON (no markdown):
{"roast":"...","vibe":"...","personality":"...","internet_archetype":"...","savage_score":7}`,
    userPrompt: (input: string) => `Roast this person: "${input}"`,
  },
  'personality-scanner': {
    system: `You are an AI personality analyzer for internet culture and creator types.
Respond ONLY with valid JSON:
{"personality_type":"...","creator_archetype":"...","dominant_traits":["...","...","..."],"viral_potential":"high","spirit_animal":"...","life_motto":"...","energy":"..."}`,
    userPrompt: (input: string) => `Analyze: "${input}"`,
  },
  'aura-detector': {
    system: `You are a mystical but fun AI aura analyzer.
Respond ONLY with valid JSON:
{"aura_color":"...","aura_description":"...","energy_level":85,"vibe":"...","element":"...","power":"...","weakness":"..."}`,
    userPrompt: (input: string) => `Detect the aura of: "${input}"`,
  },
  'future-self': {
    system: `You are a fun AI fortune teller predicting someone's future self.
Respond ONLY with valid JSON:
{"future_job":"...","personality_evolution":"...","achievement":"...","plot_twist":"...","life_advice":"...","success_probability":78}`,
    userPrompt: (input: string) => `Predict the future of: "${input}"`,
  },
  'creator-bio': {
    system: `You are an expert social media bio writer for all platforms.
Respond ONLY with valid JSON:
{"bios":[{"platform":"instagram","bio":"..."},{"platform":"tiktok","bio":"..."},{"platform":"twitter","bio":"..."},{"platform":"linkedin","bio":"..."}]}`,
    userPrompt: (input: string) => `Create bios for: "${input}"`,
  },
  'caption-generator': {
    system: `You are a viral social media caption writer.
Respond ONLY with valid JSON:
{"captions":[{"tone":"funny","caption":"..."},{"tone":"motivational","caption":"..."},{"tone":"trendy","caption":"..."}],"hashtags":["tag1","tag2","tag3","tag4","tag5"]}`,
    userPrompt: (input: string) => `Viral captions for: "${input}"`,
  },
  'title-generator': {
    system: `You are a YouTube title optimization expert.
Respond ONLY with valid JSON:
{"titles":["...","...","...","...","..."],"best_pick":"...","seo_score":87}`,
    userPrompt: (input: string) => `Viral titles for: "${input}"`,
  },
  'resume-helper': {
    system: `You are an expert resume writer and career coach.
Respond ONLY with valid JSON:
{"improved_bullets":["...","...","..."],"linkedin_summary":"...","power_words":["...","...","..."],"ats_score":82,"tips":["...","..."]}`,
    userPrompt: (input: string) => `Improve: "${input}"`,
  },
  'hook-generator': {
    system: `You are a viral content hook specialist.
Respond ONLY with valid JSON:
{"hooks":[{"type":"question","hook":"..."},{"type":"stat","hook":"..."},{"type":"story","hook":"..."},{"type":"controversial","hook":"..."}]}`,
    userPrompt: (input: string) => `Viral hooks for: "${input}"`,
  },
} as const

export type ToolSlug = keyof typeof TOOL_PROMPTS
