import type { AiRequest, AiResponse } from '@/types'

const BASE_URL = 'https://api.groq.com/openai/v1'

// Free-tier Groq models — extremely fast, zero cost on free plan
const GROQ_MODELS = {
  fast:  'llama3-8b-8192',      // 30k tokens/min free
  smart: 'llama3-70b-8192',     // 14.4k tokens/min free
  mix:   'mixtral-8x7b-32768',  // 5k tokens/min free
}

export async function callGroq(request: AiRequest): Promise<AiResponse> {
  const model = GROQ_MODELS.fast

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(request.system ? [{ role: 'system', content: request.system }] : []),
        { role: 'user', content: request.prompt },
      ],
      max_tokens:  request.max_tokens  ?? 1000,
      temperature: request.temperature ?? 0.8,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq ${res.status}: ${err}`)
  }

  const data = await res.json()
  return {
    content: data.choices?.[0]?.message?.content ?? '',
    model:   data.model ?? model,
    usage: {
      prompt_tokens:     data.usage?.prompt_tokens     ?? 0,
      completion_tokens: data.usage?.completion_tokens ?? 0,
      total_tokens:      data.usage?.total_tokens      ?? 0,
    },
  }
}
